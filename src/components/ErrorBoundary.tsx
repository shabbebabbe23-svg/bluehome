import React from "react";

type State = { hasError: boolean; error?: Error };

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // You could send this to an error tracking service
    // console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-xl bg-card border border-border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-2 text-destructive">Ett fel uppstod</h2>
            <p className="text-sm text-muted-foreground mb-4">Appen träffade ett oväntat fel. Detaljer visas i konsolen.</p>
            <pre className="text-xs text-left overflow-auto max-h-48 bg-muted p-2 rounded">{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
