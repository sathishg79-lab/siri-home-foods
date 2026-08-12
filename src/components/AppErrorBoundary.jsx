import React from 'react';

/** Keeps a client-side error from turning the storefront into a blank page. */
export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Siri Home Foods app error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', fontFamily: 'Arial, sans-serif', textAlign: 'center', color: '#3b2418' }}>
          <section>
            <h1>Siri Home Foods</h1>
            <p>We are refreshing the store. Please reload once.</p>
            <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: '8px', padding: '12px 20px', background: '#b54a24', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>
              Reload website
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
