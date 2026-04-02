export const SLEEP_POSITIONS = [
  {
    id: 'left_side_pillow',
    label: 'Left Side with Pillow',
    description: 'Lying on your left side with a pillow between your knees for spinal alignment.',
    good_for: ['acid reflux', 'pregnancy', 'heart health', 'snoring reduction', 'lymphatic drainage'],
    avoid_for: ['left shoulder pain', 'left hip pain'],
  },
  {
    id: 'right_side_pillow',
    label: 'Right Side with Pillow',
    description: 'Lying on your right side with a pillow between your knees for hip and spine support.',
    good_for: ['left shoulder or hip pain relief', 'general comfort', 'snoring reduction'],
    avoid_for: ['acid reflux', 'right shoulder pain', 'right hip pain'],
  },
  {
    id: 'back',
    label: 'On Your Back',
    description: 'Lying flat on your back with a pillow under your head and optionally under your knees.',
    good_for: ['spinal alignment', 'neck pain relief', 'reducing facial pressure', 'post-surgical recovery'],
    avoid_for: ['sleep apnea', 'snoring', 'third trimester pregnancy', 'severe acid reflux'],
  },
  {
    id: 'stomach',
    label: 'On Your Stomach',
    description: 'Lying face down with head turned to one side.',
    good_for: ['snoring reduction in some cases'],
    avoid_for: ['neck pain', 'lower back pain', 'lumbar disc issues', 'cervical spine conditions', 'pregnancy'],
  },
  {
    id: 'back_elevated',
    label: 'Back with Head Elevated',
    description: 'Lying on your back with the head and upper body elevated using a wedge pillow or adjustable bed.',
    good_for: ['acid reflux', 'GERD', 'sleep apnea', 'respiratory issues', 'heart failure', 'post-surgery'],
    avoid_for: ['hip flexor tightness if not supported'],
  },
  {
    id: 'side_pillow_between_knees',
    label: 'Side with Pillow Between Knees',
    description: 'Lying on either side with a pillow placed between the knees to reduce hip and lower back strain.',
    good_for: ['lower back pain', 'hip pain', 'sciatica', 'lumbar disc issues', 'post hip replacement', 'pregnancy'],
    avoid_for: ['shoulder pain on the lying side if no shoulder pillow support'],
  },
] as const
