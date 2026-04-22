import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorScreen from './ErrorScreen';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  correlationId: string | null;
}

const generateCorrelationId = () => {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `RP-${time}-${rand}`.toUpperCase();
};

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, correlationId: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, correlationId: generateCorrelationId() };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', {
      correlationId: this.state.correlationId,
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      const tech = [
        this.state.error?.message,
        this.state.error?.stack,
      ]
        .filter(Boolean)
        .join('\n\n');
      return (
        <ErrorScreen
          correlationId={this.state.correlationId ?? undefined}
          technicalMessage={tech || undefined}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
