import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ErrorBoundary } from '../ErrorBoundary';

// A component that can be triggered to throw an error on demand
const ProblematicChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test crash in child component');
  }
  return <div data-testid="healthy-child">All civic services operational</div>;
};

// Stateful parent component to verify error recovery
const ControlledParent = () => {
  const [hasError, setHasError] = useState(true);

  return (
    <ErrorBoundary
      boundaryName="Test Section"
      onReset={() => setHasError(false)}
    >
      <ProblematicChild shouldThrow={hasError} />
    </ErrorBoundary>
  );
};

describe('ErrorBoundary Component', () => {
  // Suppress console.error in vitest output for expected thrown errors in tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('renders normal children when no error occurs', () => {
    render(
      <ErrorBoundary boundaryName="Safe Zone">
        <ProblematicChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('healthy-child')).toBeInTheDocument();
    expect(screen.getByText('All civic services operational')).toBeInTheDocument();
  });

  it('catches an uncaught child error and displays the full fallback UI with boundary name', () => {
    render(
      <ErrorBoundary boundaryName="Civic Heatmap">
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Error Boundary: Civic Heatmap/i)).toBeInTheDocument();
    expect(screen.getByText(/Something interrupted this municipal process/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recover & Retry/i })).toBeInTheDocument();
  });

  it('dispatches the onError telemetry callback when a child component fails', () => {
    const onErrorMock = vi.fn();

    render(
      <ErrorBoundary boundaryName="AI Triage Desk" onError={onErrorMock}>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test crash in child component' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('allows the user to inspect technical diagnostic details', () => {
    render(
      <ErrorBoundary boundaryName="Diagnostic Test">
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const toggleButton = screen.getByRole('button', { name: /Inspect Diagnostics/i });
    expect(toggleButton).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(toggleButton);
    expect(screen.getAllByText(/Test crash in child component/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Component Hierarchy:/i)).toBeInTheDocument();
  });

  it('renders a compact inline alert card when isolateCard is true', () => {
    render(
      <ErrorBoundary boundaryName="Ward Mini Card" isolateCard={true}>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Ward Mini Card temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  it('successfully recovers and re-renders children upon clicking Recover & Retry', () => {
    render(<ControlledParent />);

    // Initially fails and displays alert
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // User clicks 'Recover & Retry' which triggers onReset and sets hasError to false
    const retryBtn = screen.getByRole('button', { name: /Recover & Retry/i });
    fireEvent.click(retryBtn);

    // After reset, child recovers and displays normal content
    expect(screen.getByTestId('healthy-child')).toBeInTheDocument();
  });
});
