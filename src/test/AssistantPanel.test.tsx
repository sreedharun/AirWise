import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssistantPanel } from '../components/AssistantPanel';

describe('AssistantPanel Component', () => {
  it('renders deterministic guidance headline, actions, and offline badge', () => {
    render(<AssistantPanel aqi={45} userGroup="general" locationName="London" />);

    expect(
      screen.getByRole('heading', { level: 2, name: /airwise health advisor/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/100% offline capable & deterministic/i)).toBeInTheDocument();

    // Check actions
    expect(screen.getByText('Outdoor Exercise')).toBeInTheDocument();
    expect(screen.getByText('Mask Guidance')).toBeInTheDocument();
    expect(screen.getByText('Home Ventilation')).toBeInTheDocument();

    // Check Do's and Don'ts
    expect(screen.getByText(/recommended \(do\)/i)).toBeInTheDocument();
    expect(screen.getByText(/avoid \(don't\)/i)).toBeInTheDocument();
  });

  it('handles quick inquiry question clicks and streams deterministic answer', () => {
    render(<AssistantPanel aqi={165} userGroup="respiratory" locationName="Delhi" />);

    const runQuestionBtn = screen.getByRole('button', {
      name: /can i exercise outdoors right now\?/i,
    });
    fireEvent.click(runQuestionBtn);

    // Stream should contain user question and assistant answer
    expect(
      screen.getAllByText(/can i exercise outdoors right now\?/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/do not go outdoors/i).length).toBeGreaterThanOrEqual(2);
  });
});
