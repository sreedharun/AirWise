import React from 'react';

export const MedicalDisclaimer: React.FC = () => {
  return (
    <aside className="medical-disclaimer-box" aria-label="Medical Disclaimer">
      <div className="disclaimer-icon" aria-hidden="true">
        ℹ️
      </div>
      <div className="disclaimer-body">
        <p>
          <strong>Medical & Health Disclaimer:</strong> All recommendations and air quality insights
          provided by AirWise are strictly for informational and educational purposes. They do not
          constitute medical diagnosis, professional health advice, or clinical treatment plans.
          Individuals experiencing acute respiratory distress, severe asthma, or chest pain should
          consult a certified physician or call local emergency services immediately.
        </p>
      </div>
    </aside>
  );
};
