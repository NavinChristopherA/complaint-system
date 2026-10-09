/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ERROR BOUNDARY — React Class Component for Crash Containment  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  PURPOSE:                                                       ║
 * ║  Catches JavaScript errors during React rendering, lifecycle    ║
 * ║  methods, and constructors of the child component tree.         ║
 * ║  Displays a graceful fallback UI instead of a blank white       ║
 * ║  screen, preserving user trust and enabling recovery.           ║
 * ║                                                                 ║
 * ║  SCOPE OF ERROR CAPTURE:                                        ║
 * ║  ✔ Errors in render()                                           ║
 * ║  ✔ Errors in lifecycle methods (componentDidMount, etc.)        ║
 * ║  ✔ Errors in constructors of child components                   ║
 * ║  ✘ Event handlers (use try/catch in handlers directly)          ║
 * ║  ✘ Async code (setTimeout, fetch — use .catch() or try/catch)  ║
 * ║  ✘ Server-side rendering                                       ║
 * ║  ✘ Errors thrown in the boundary itself                         ║
 * ║                                                                 ║
 * ║  USAGE:                                                         ║
 * ║  Wrap any subtree you want to protect:                          ║
 * ║                                                                 ║
 * ║    <ErrorBoundary fallbackTitle="Dashboard Error">              ║
 * ║      <AdminDashboard />                                         ║
 * ║    </ErrorBoundary>                                             ║
 * ║                                                                 ║
 * ║  UNIT TESTING GUIDANCE:                                         ║
 * ║  1. Create a "BombComponent" that throws during render:         ║
 * ║     const Bomb = () => { throw new Error('💥'); return null; }  ║
 * ║  2. Wrap it in <ErrorBoundary><Bomb /></ErrorBoundary>          ║
 * ║  3. Assert that the fallback UI is rendered, NOT the child.     ║
 * ║  4. Assert that the "Try Again" button resets hasError state.   ║
 * ║  5. Use jest.spyOn(console, 'error') to suppress noise.        ║
 * ║                                                                 ║
 * ║  See: TESTING.md §3 "Error Boundary Test Matrix" for full      ║
 * ║  test case inventory including edge cases.                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Props Interface ──────────────────────────────────────────────
/**
 * @prop children       — The component subtree to protect.
 * @prop fallbackTitle  — (Optional) Custom heading shown on error screen.
 *                        Defaults to "Something Went Wrong".
 * @prop onError        — (Optional) Callback invoked when an error is caught.
 *                        Useful for external telemetry, Sentry, or analytics.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// ─── State Interface ──────────────────────────────────────────────
/**
 * @field hasError       — Whether an error has been caught.
 * @field error          — The caught Error object (for display in dev mode).
 * @field errorInfo      — React's ErrorInfo containing the component stack trace.
 * @field showDetails    — Toggle for expanding/collapsing technical stack trace.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  /**
   * getDerivedStateFromError — Static lifecycle called during the "render" phase.
   * Updates state so the next render shows the fallback UI.
   * This method is called BEFORE the component re-renders.
   *
   * IMPORTANT FOR TESTING:
   * - This is called synchronously. Any test that throws in a child component's
   *   render method will trigger this immediately.
   * - To test: render a child that throws, then query for the fallback UI.
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * componentDidCatch — Lifecycle called during the "commit" phase.
   * Use this for side effects like logging to an error reporting service.
   *
   * @param error     - The error that was thrown.
   * @param errorInfo - An object with a `componentStack` property containing
   *                    information about which component threw the error.
   *
   * UNIT TESTING GUIDANCE:
   * - Spy on this method to verify it receives the correct error and stack.
   * - Mock `console.error` to prevent noisy test output.
   * - Verify `props.onError` callback is invoked with correct arguments.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Store errorInfo for optional display in the fallback UI
    this.setState({ errorInfo });

    // Log to console for development debugging
    console.error(
      '[ErrorBoundary] Caught error in component tree:',
      error,
      errorInfo.componentStack
    );

    // Invoke external error handler if provided (e.g., Sentry, analytics)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * handleReset — Clears the error state and attempts to re-render children.
   * Connected to the "Try Again" button in the fallback UI.
   *
   * UNIT TESTING GUIDANCE:
   * - After clicking "Try Again", verify that `hasError` is reset to false.
   * - If the underlying error is fixed, children should render normally.
   * - If the error persists, the boundary will catch it again.
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  /**
   * toggleDetails — Expands/collapses the technical error stack trace
   * in the fallback UI. Only visible in development for debugging.
   */
  toggleDetails = (): void => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallbackTitle = 'Something Went Wrong' } = this.props;
      const { error, errorInfo, showDetails } = this.state;
      const isDev = import.meta.env?.DEV ?? false;

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            minHeight: '300px',
            textAlign: 'center',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          {/* Error Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
            }}
          >
            <AlertTriangle size={28} color="#dc2626" />
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1e293b',
              margin: '0 0 0.5rem 0',
            }}
          >
            {fallbackTitle}
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: '0.9rem',
              color: '#64748b',
              maxWidth: '420px',
              margin: '0 0 1.5rem 0',
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred while rendering this section.
            This has been logged automatically. Please try again or
            contact the Municipal IT Helpdesk if the problem persists.
          </p>

          {/* Error message (development only) */}
          {isDev && error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Bug size={14} color="#dc2626" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase' }}>
                  Development Error Details
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#991b1b', margin: 0, fontFamily: 'monospace' }}>
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseOver={e => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseOut={e => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              <RefreshCw size={15} />
              Try Again
            </button>

            {/* Stack trace toggle (development only) */}
            {isDev && errorInfo && (
              <button
                onClick={this.toggleDetails}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#475569',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showDetails ? 'Hide Stack Trace' : 'Show Stack Trace'}
              </button>
            )}
          </div>

          {/* Expandable Component Stack Trace (development only) */}
          {isDev && showDetails && errorInfo && (
            <pre
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#1e293b',
                color: '#94a3b8',
                borderRadius: '8px',
                fontSize: '0.7rem',
                textAlign: 'left',
                maxWidth: '600px',
                width: '100%',
                overflow: 'auto',
                maxHeight: '250px',
                lineHeight: 1.5,
              }}
            >
              {errorInfo.componentStack}
            </pre>
          )}
        </div>
      );
    }

    // No error — render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
