import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../components/SearchBar';
import * as geocodingApi from '../api/geocoding';

describe('SearchBar Component', () => {
  it('renders input, location button, and popular city quick-picks', () => {
    const onSelectLocation = vi.fn();
    const onUseLocation = vi.fn();

    render(
      <SearchBar
        onSelectLocation={onSelectLocation}
        onUseLocation={onUseLocation}
        currentLocationName="New York"
      />
    );

    expect(screen.getByPlaceholderText(/search city/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /use my current geographic location/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /london/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tokyo/i })).toBeInTheDocument();
  });

  it('triggers geocoding search and shows autocomplete suggestions', async () => {
    const mockResults = [{ name: 'Tokyo', country: 'Japan', latitude: 35.68, longitude: 139.69 }];
    vi.spyOn(geocodingApi, 'searchCities').mockResolvedValue(mockResults);

    const onSelectLocation = vi.fn();
    const onUseLocation = vi.fn();

    render(<SearchBar onSelectLocation={onSelectLocation} onUseLocation={onUseLocation} />);

    const input = screen.getByPlaceholderText(/search city/i);
    await userEvent.type(input, 'Tokyo');

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /tokyo/i })).toBeInTheDocument();
    });

    // Click suggestion
    fireEvent.click(screen.getByRole('option', { name: /tokyo/i }));
    expect(onSelectLocation).toHaveBeenCalledWith(mockResults[0]);
  });

  it('handles quick pick popular city selection', () => {
    const onSelectLocation = vi.fn();
    const onUseLocation = vi.fn();

    render(<SearchBar onSelectLocation={onSelectLocation} onUseLocation={onUseLocation} />);

    const parisBtn = screen.getByRole('button', { name: /paris/i });
    fireEvent.click(parisBtn);

    expect(onSelectLocation).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Paris', latitude: 48.8566 })
    );
  });

  it('renders location error banner when permission is denied', () => {
    const onSelectLocation = vi.fn();
    const onUseLocation = vi.fn();
    const onClearError = vi.fn();

    render(
      <SearchBar
        onSelectLocation={onSelectLocation}
        onUseLocation={onUseLocation}
        locationError="Location permission was denied. You can search for any city in the search bar."
        onClearLocationError={onClearError}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/location permission was denied/i)).toBeInTheDocument();

    const dismissBtn = screen.getByLabelText(/dismiss location warning/i);
    fireEvent.click(dismissBtn);
    expect(onClearError).toHaveBeenCalled();
  });

  it('navigates autocomplete suggestions with ArrowDown, ArrowUp, Enter, and Escape', async () => {
    const mockResults = [
      { name: 'Madrid', country: 'Spain', latitude: 40.41, longitude: -3.7 },
      { name: 'Madurai', country: 'India', latitude: 9.92, longitude: 78.11 },
    ];
    vi.spyOn(geocodingApi, 'searchCities').mockResolvedValue(mockResults);

    const onSelectLocation = vi.fn();
    const onUseLocation = vi.fn();

    render(<SearchBar onSelectLocation={onSelectLocation} onUseLocation={onUseLocation} />);

    const input = screen.getByPlaceholderText(/search city/i);
    await userEvent.type(input, 'Mad');

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /madrid/i })).toBeInTheDocument();
    });

    // ArrowDown to highlight first option
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // ArrowDown to highlight second option
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // ArrowUp to return to first option
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    // Press Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelectLocation).toHaveBeenCalledWith(mockResults[0]);

    // Test Escape to close
    await userEvent.type(input, 'Mad');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const onSelectLocation = vi.fn();
    const onUseLocation = vi.fn();

    render(<SearchBar onSelectLocation={onSelectLocation} onUseLocation={onUseLocation} />);

    const input = screen.getByPlaceholderText(/search city/i) as HTMLInputElement;
    await userEvent.type(input, 'Rome');
    expect(input.value).toBe('Rome');

    const clearBtn = screen.getByLabelText(/clear city search input/i);
    fireEvent.click(clearBtn);

    expect(input.value).toBe('');
  });
});
