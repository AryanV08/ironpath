import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { useApp } from '../../context/AppContext';
import {
  analyzeForm,
  computeSquatMetrics,
  createBaseline,
  createRepTracker,
  getDisplayScore,
  getKneeBend,
  getPhaseLabel,
  isCalibrated,
  isUserSquatting,
  updateBaseline,
  updateRepTracker,
  type FormFeedback,
  type RepTrackerState,
  type SquatBaseline,
} from '../../utils/squatAnalysis';
import { countVisibleKeypoints, drawPoseOverlay, normalizeKeypoints } from '../../utils/poseDrawing';
import './SquatTracker.css';

interface SquatLiveTrackingProps {
  paused: boolean;
  trackingActive: boolean;
  setKey: number;
  showCountdown?: boolean;
  countdownValue?: number;
}

export function SquatLiveTracking({
  paused,
  trackingActive,
  setKey,
  showCountdown = false,
  countdownValue = 0,
}: SquatLiveTrackingProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const animRef = useRef<number>(0);
  const repTrackerRef = useRef<RepTrackerState>(createRepTracker());
  const baselineRef = useRef<SquatBaseline>(createBaseline());

  const { state, dispatch } = useApp();
  const { workout } = state;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FormFeedback>({
    messages: ['Loading camera…'],
    warnings: [],
    score: 100,
    isGood: false,
    showBadge: false,
  });
  const [displayScore, setDisplayScore] = useState(100);
  const [lastRepScore, setLastRepScore] = useState<number | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<string>('Initializing…');
  const [phaseLabel, setPhaseLabel] = useState('Standing');
  const [calibrated, setCalibrated] = useState(false);

  useEffect(() => {
    repTrackerRef.current = createRepTracker();
    baselineRef.current = createBaseline();
    setCalibrated(false);
    setLastRepScore(null);
  }, [setKey]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await tf.setBackend('webgl');
        await tf.ready();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false,
        });

        if (!mounted || !videoRef.current) return;

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          },
        );

        if (!mounted) {
          detector.dispose();
          return;
        }

        detectorRef.current = detector;
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Camera access denied. Allow webcam to track squats.',
        );
        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(animRef.current);
      detectorRef.current?.dispose();
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (loading || error) return;

    const detect = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const detector = detectorRef.current;
      if (!video || !canvas || !detector || video.readyState < 2) {
        animRef.current = requestAnimationFrame(detect);
        return;
      }

      const poses = await detector.estimatePoses(video);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (poses[0]) {
        const kps = normalizeKeypoints(poses[0].keypoints);
        const visibleCount = countVisibleKeypoints(kps);
        let tracker = repTrackerRef.current;

        const rawAngles = computeSquatMetrics(kps, baselineRef.current);
        if (rawAngles && !isCalibrated(baselineRef.current)) {
          baselineRef.current = updateBaseline(baselineRef.current, rawAngles, kps);
        }

        const cal = isCalibrated(baselineRef.current);
        if (cal !== calibrated) setCalibrated(cal);

        const angles = computeSquatMetrics(kps, baselineRef.current);
        const active = trackingActive && !paused && workout.repsRemaining > 0;

        let form: FormFeedback = {
          messages: ['Move into frame — show hips & knees'],
          warnings: [],
          score: 100,
          isGood: false,
          showBadge: false,
        };

        if (angles && cal) {
          if (active) {
            form = analyzeForm(angles, tracker.phase, true, baselineRef.current);

            const { tracker: nextTracker, repCompleted } = updateRepTracker(
              tracker,
              angles,
              form.score,
              form.warnings,
              true,
              baselineRef.current,
            );
            tracker = nextTracker;
            repTrackerRef.current = nextTracker;

            form = analyzeForm(
              angles,
              nextTracker.phase,
              true,
              baselineRef.current,
            );

            const score = getDisplayScore(nextTracker, form.score);
            setDisplayScore(score);
            setFeedback(form);
            setPhaseLabel(getPhaseLabel(nextTracker.phase));

            if (repCompleted) {
              form = analyzeForm(
                angles,
                nextTracker.phase,
                true,
                baselineRef.current,
              );
              setLastRepScore(repCompleted.formScore);
              dispatch({
                type: 'COMPLETE_REP',
                payload: {
                  formScore: repCompleted.formScore,
                  warnings: repCompleted.warnings,
                },
              });
            }

            dispatch({ type: 'UPDATE_WORKOUT', payload: { formScore: score } });
          } else {
            form = analyzeForm(angles, tracker.phase, true, baselineRef.current);
            setPhaseLabel(getPhaseLabel(tracker.phase));
            if (!showCountdown) {
              setFeedback({
                messages: ['Stand tall — squat when set begins'],
                warnings: [],
                score: 100,
                isGood: false,
                showBadge: false,
              });
            } else {
              setFeedback({
                messages: [`Get ready — ${workout.repsRemaining} reps`],
                warnings: [],
                score: 100,
                isGood: false,
                showBadge: false,
              });
            }
          }

          const bend = getKneeBend(angles, baselineRef.current);
          const squatting = isUserSquatting(angles, tracker.phase, baselineRef.current);

          setTrackingStatus(
            !active
              ? showCountdown
                ? `Set ${workout.currentSet} starts in ${countdownValue}…`
                : `Ready · ${visibleCount}/17 keypoints`
              : squatting
                ? `${getPhaseLabel(tracker.phase)} · knee bend ${Math.round(bend)}°`
                : `Standing · bend ${Math.round(bend)}° to start`,
          );
        } else if (!cal) {
          setTrackingStatus(`Detecting pose… ${visibleCount}/17 visible`);
        }

        drawPoseOverlay(ctx, kps, active ? form.warnings : []);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setTrackingStatus('Step back — full body must be visible');
      }

      animRef.current = requestAnimationFrame(detect);
    };

    animRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animRef.current);
  }, [
    loading,
    error,
    paused,
    dispatch,
    trackingActive,
    showCountdown,
    countdownValue,
    workout.repsRemaining,
    workout.currentSet,
    calibrated,
  ]);

  const showFormBadge = calibrated && trackingActive && !paused && feedback.showBadge;
  const formBadgeClass = feedback.isGood ? 'form-badge good' : 'form-badge bad';
  const scoreClass = displayScore >= 75 ? 'good' : 'bad';

  return (
    <div className="squat-tracker">
      <p className="set-label">
        Set {workout.currentSet}/{workout.totalSets}
      </p>

      <div className="squat-viewport glass-card">
        <video ref={videoRef} className="squat-video" playsInline muted />
        <canvas ref={canvasRef} className="squat-canvas" />

        {(loading || error) && (
          <div className="loading-overlay">
            {loading ? (
              <>
                <div className="loading-spinner" />
                Loading MoveNet model…
              </>
            ) : (
              <span>{error}</span>
            )}
          </div>
        )}

        {showCountdown && !loading && !error && (
          <div className="countdown-overlay">
            <p className="countdown-label">SET {workout.currentSet} STARTS IN</p>
            <div className="countdown-number">{countdownValue}</div>
          </div>
        )}

        {!loading && !error && !showCountdown && (
          <>
            <div className="tracking-status">{trackingStatus}</div>
            {showFormBadge && (
              <div className={formBadgeClass}>
                {feedback.isGood ? '✓ GOOD FORM' : '✕ FIX FORM'}
              </div>
            )}
          </>
        )}

        {showFormBadge && (
          <div className="squat-feedback-overlay">
            {feedback.warnings.map((warn, i) => (
              <div key={`${warn}-${i}`} className="feedback-line">
                <span className="warn">!</span>
                <span>{warn}</span>
                <span>→</span>
                <span className="fix">{feedback.messages[i] ?? ''}</span>
              </div>
            ))}
            {feedback.warnings.length === 0 && feedback.messages[0] && (
              <div className="feedback-line">
                <span>{feedback.messages[0]}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="squat-stats">
        <div>
          <div className="stat-value">{workout.repsRemaining}</div>
          <div className="stat-label">REPS LEFT</div>
        </div>
        <div>
          <div className={`stat-value ${scoreClass}`}>
            {displayScore}
            {displayScore < 75 && <span className="trend-down"> ▼</span>}
            {displayScore >= 90 && <span className="trend-up"> ▲</span>}
          </div>
          <div className="stat-label">FORM SCORE · {phaseLabel.toUpperCase()}</div>
          {lastRepScore !== null && (
            <div className="rep-score-note">Last rep: {lastRepScore}</div>
          )}
        </div>
      </div>
    </div>
  );
}
