import React from 'react';
import { UserGroup } from '../api/types';
import { USER_GROUPS } from '../utils/adviceEngine';

interface GroupSelectorProps {
  selectedGroup: UserGroup;
  onSelectGroup: (group: UserGroup) => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({ selectedGroup, onSelectGroup }) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % USER_GROUPS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + USER_GROUPS.length) % USER_GROUPS.length;
    }

    if (nextIndex !== index) {
      const nextGroup = USER_GROUPS[nextIndex].id;
      onSelectGroup(nextGroup);
      const element = document.getElementById(`group-tab-${nextGroup}`);
      element?.focus();
    }
  };

  return (
    <div className="group-selector-container">
      <div className="group-selector-header">
        <label id="group-selector-label" className="group-selector-title">
          <span>Tailored Health Profile</span>
          <span className="tooltip-hint">(Select your group for customized guidance)</span>
        </label>
      </div>

      <div role="radiogroup" aria-labelledby="group-selector-label" className="group-chips-grid">
        {USER_GROUPS.map((group, idx) => {
          const isSelected = selectedGroup === group.id;
          return (
            <button
              key={group.id}
              id={`group-tab-${group.id}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={`group-chip ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectGroup(group.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              title={group.description}
            >
              <span className="chip-icon" aria-hidden="true">
                {group.icon}
              </span>
              <span className="chip-label">{group.label}</span>
              {isSelected && (
                <span className="chip-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="group-active-desc" aria-live="polite">
        <strong>Active Profile:</strong>{' '}
        {USER_GROUPS.find((g) => g.id === selectedGroup)?.description}
      </p>
    </div>
  );
};
