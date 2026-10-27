import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

/**
 * Props accepted by the ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
  /** The child component tree to be guarded by this boundary */
  children: ReactNode;
  /** Optional custom fallback node or render function receiving the error and reset callback */
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  /** Descriptive identifier for the boundary (e.g. 'WardMap', 'AITriageQueue', 'RootApp') */
  boundaryName?: string;
  /** Callback fired when an uncaught error is caught by this boundary, ideal for telemetry/Sentry */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Callback fired when the user clicks 'Try Again' or resets the boundary */
  onReset?: () => void;
  /** If true, renders a compact, inline alert card rather than a full-section error container */
  isolateCard?: boolean;
}

/**
 * Internal state for the ErrorBoundary component.
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Production-Grade React Error Boundary for Namma Pollachi Civic Redressal Portal.
 * 
 * Blast Radius Containment:
 * Wrapping high-risk dynamic sections (such as interactive SVG maps, real-time AI triage summaries,
 * or localStorage JSON hydrators) prevents an unhandled exception in one component from
 * unmounting the entire application tree.
 * 
 * Recovery Workflow:
 * Provides user-facing recovery options:
 * 1. "Try Again" / "Retry Component" — resets local boundary state.
 * 2. "Reload Page" — performs a clean document reload.
 * 3. Collapsible Diagnostic Drawer — displays error message and component stack trace for municipal QA.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  /**
   * Static lifecycle method called when an error is thrown in a descendant component.
   * Updates state so the next render shows the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Catches errors thrown in children and captures stack information.
   * Dispatches error telemetry to any attached listener (e.g. Sentry, OpenTelemetry, console).
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log structured diagnostic data
    console.error(
      `[ErrorBoundary: ${this.props.boundaryName || 'Unnamed'}] Caught uncaught component error:`,
      error,
      errorInfo
    );

    // Invoke external telemetry handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (telemetryErr) {
        console.error('[ErrorBoundary] Telemetry callback threw an error:', telemetryErr);
      }
    }
  }

  /**
   * Resets the boundary state, allowing children to attempt re-rendering.
   */
  public resetError = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render(): ReactNode {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback, boundaryName = 'Component Section', isolateCard = false } = this.props;

    if (!hasError) {
      return children;
    }

    // Custom fallback support
    if (typeof fallback === 'function') {
      return fallback(error || new Error('Unknown error'), this.resetError);
    }
    if (fallback) {
      return fallback;
    }

    // Compact inline card fallback for isolated widgets
    if (isolateCard) {
      return (
        <div
          role="alert"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg, 12px)',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#9f1239',
            margin: '0.75rem 0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={20} color="#e11d48" />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              {boundaryName} temporarily unavailable
            </h4>
          </div>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.825rem', color: '#881337', lineHeight: 1.4 }}>
            An unexpected error occurred while rendering this civic widget. Other services remain fully operational.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={this.resetError}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#9f1239',
                background: '#ffe4e6',
                border: '1px solid #fecdd3',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        </div>
      );
    }

    // Full Section Fallback for major views
    return (
      <div
        role="alert"
        style={{
          margin: '2rem auto',
          maxWidth: '720px',
          padding: '2rem',
          borderRadius: '16px',
          background: 'white',
          border: '1px solid #fee2e2',
          boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '12px',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                Error Boundary: {boundaryName}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
              Something interrupted this municipal process
            </h3>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
              The portal encountered an unexpected state in this section. Your complaint submissions, active tickets, and local data remain safely saved.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #f1f5f9',
            marginTop: '1rem',
          }}
        >
          <button
            onClick={this.resetError}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              background: 'var(--primary-700, #047857)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <RefreshCw size={16} /> Recover & Retry
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <Home size={16} /> Reload Page
          </button>

          <button
            onClick={this.toggleDetails}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.6rem 1rem',
              background: 'transparent',
              color: '#64748b',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showDetails ? 'Hide Diagnostics' : 'Inspect Diagnostics'}
          </button>
        </div>

        {/* Collapsible Diagnostic Details for Municipal Evaluators */}
        {showDetails && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#0f172a',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '0.8rem',
              fontFamily: 'ui-monospace, monospace',
              overflowX: 'auto',
              maxHeight: '260px',
              border: '1px solid #334154',
            }}
          >
            <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.5rem' }}>
              {error?.name || 'Error'}: {error?.message || 'Unknown error occurred'}
            </div>
            {error?.stack && (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#94a3b8' }}>
                {error.stack}
              </pre>
            )}
            {errorInfo?.componentStack && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #334155' }}>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Component Hierarchy:</span>
                <pre style={{ margin: '0.35rem 0 0 0', whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
