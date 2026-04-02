export const CRITICAL_VALUE_ACTIONS: Record<
  string,
  { high_action: string; low_action: string; contact_urgency: 'monitor' | 'contact_doctor_today' | 'emergency' }
> = {
  potassium: {
    high_action: 'Hyperkalemia detected. Avoid high-potassium foods (bananas, oranges, potatoes). Seek emergency care if above 6.5 mEq/L or if you have heart symptoms.',
    low_action: 'Hypokalemia detected. Increase potassium-rich foods under guidance. Contact your doctor today as this can affect heart rhythm.',
    contact_urgency: 'emergency',
  },
  sodium: {
    high_action: 'Hypernatremia detected. Increase fluid intake. Contact your doctor today — severe cases require hospitalisation.',
    low_action: 'Hyponatremia detected. Do not over-hydrate with plain water. Contact your doctor today — severe cases are a medical emergency.',
    contact_urgency: 'emergency',
  },
  glucose: {
    high_action: 'Critically high blood sugar. Check for ketones if diabetic. Seek emergency care if above 400 mg/dL or if you feel unwell.',
    low_action: 'Critically low blood sugar (hypoglycaemia). Consume fast-acting sugar immediately (juice, glucose tablets). Seek emergency care if unconscious or unresponsive.',
    contact_urgency: 'emergency',
  },
  creatinine: {
    high_action: 'Elevated creatinine indicates reduced kidney function. Avoid NSAIDs and nephrotoxic medications. Contact your doctor today.',
    low_action: 'Low creatinine may indicate reduced muscle mass. Contact your doctor today for clinical evaluation.',
    contact_urgency: 'contact_doctor_today',
  },
  hemoglobin: {
    high_action: 'Elevated haemoglobin may indicate dehydration or polycythaemia. Contact your doctor today.',
    low_action: 'Critically low haemoglobin indicates severe anaemia. Seek emergency care — you may require a transfusion.',
    contact_urgency: 'emergency',
  },
  platelet_count: {
    high_action: 'Elevated platelets (thrombocytosis) increase clotting risk. Contact your doctor today.',
    low_action: 'Critically low platelets (thrombocytopenia) — severe bleeding risk. Seek emergency care immediately.',
    contact_urgency: 'emergency',
  },
  troponin: {
    high_action: 'Elevated troponin indicates possible heart muscle damage. Seek emergency care immediately — this may indicate a heart attack.',
    low_action: 'Troponin is not typically critically low. Monitor and consult your doctor.',
    contact_urgency: 'emergency',
  },
  INR: {
    high_action: 'Critically high INR — severely elevated bleeding risk. Seek emergency care. If on warfarin, contact your doctor immediately.',
    low_action: 'Low INR while on anticoagulation indicates sub-therapeutic levels — increased clot risk. Contact your doctor today.',
    contact_urgency: 'emergency',
  },
  calcium: {
    high_action: 'Hypercalcaemia detected. Stay well hydrated. Contact your doctor today — severe levels require hospitalisation.',
    low_action: 'Hypocalcaemia detected. Risk of muscle cramps and cardiac arrhythmias. Contact your doctor today.',
    contact_urgency: 'contact_doctor_today',
  },
  pH: {
    high_action: 'Alkalosis detected. Seek emergency care — critically high blood pH requires immediate medical assessment.',
    low_action: 'Acidosis detected. Seek emergency care — critically low blood pH requires immediate medical assessment.',
    contact_urgency: 'emergency',
  },
}
