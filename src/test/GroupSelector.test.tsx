import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroupSelector } from '../components/GroupSelector';

describe('GroupSelector Component', () => {
  it('renders all 5 health profile radio chips with descriptions', () => {
    const onSelectGroup = vi.fn();
    render(<GroupSelector selectedGroup="general" onSelectGroup={onSelectGroup} />);

    expect(screen.getByRole('radio', { name: /general public/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /children & teens/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /older adults/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /asthma & respiratory/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /outdoor athletes/i })).toBeInTheDocument();

    const generalRadio = screen.getByRole('radio', { name: /general public/i });
    expect(generalRadio).toHaveAttribute('aria-checked', 'true');
    expect(generalRadio).toHaveAttribute('tabIndex', '0');
  });

  it('calls onSelectGroup when a chip is clicked', () => {
    const onSelectGroup = vi.fn();
    render(<GroupSelector selectedGroup="general" onSelectGroup={onSelectGroup} />);

    const asthmaRadio = screen.getByRole('radio', { name: /asthma & respiratory/i });
    fireEvent.click(asthmaRadio);

    expect(onSelectGroup).toHaveBeenCalledWith('respiratory');
  });

  it('handles keyboard navigation with ArrowRight and ArrowLeft', () => {
    const onSelectGroup = vi.fn();
    render(<GroupSelector selectedGroup="general" onSelectGroup={onSelectGroup} />);

    const generalRadio = screen.getByRole('radio', { name: /general public/i });

    // ArrowRight should navigate to children (index 1)
    fireEvent.keyDown(generalRadio, { key: 'ArrowRight' });
    expect(onSelectGroup).toHaveBeenCalledWith('children');

    // ArrowLeft from general (index 0) should wrap around to athletes (last index)
    fireEvent.keyDown(generalRadio, { key: 'ArrowLeft' });
    expect(onSelectGroup).toHaveBeenCalledWith('athletes');

    // ArrowDown should navigate forward
    fireEvent.keyDown(generalRadio, { key: 'ArrowDown' });
    expect(onSelectGroup).toHaveBeenCalledWith('children');

    // ArrowUp should navigate backward
    fireEvent.keyDown(generalRadio, { key: 'ArrowUp' });
    expect(onSelectGroup).toHaveBeenCalledWith('athletes');
  });

  it('updates the active profile description dynamically', () => {
    const onSelectGroup = vi.fn();
    const { rerender } = render(
      <GroupSelector selectedGroup="general" onSelectGroup={onSelectGroup} />
    );
    expect(
      screen.getByText(/healthy adults with no diagnosed chronic pulmonary conditions/i)
    ).toBeInTheDocument();

    rerender(<GroupSelector selectedGroup="athletes" onSelectGroup={onSelectGroup} />);
    expect(
      screen.getByText(/runners, cyclists, and outdoor workers breathing high air volumes/i)
    ).toBeInTheDocument();
  });
});
