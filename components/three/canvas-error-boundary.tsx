"use client";

import { Component, type ReactNode } from "react";

/**
 * Rede de segurança do protótipo WebGL: se o Canvas lançar durante a
 * montagem (driver instável, contexto recusado), cai para o `fallback`
 * estático em vez de deixar a Hero com um buraco vazio.
 */
class CanvasErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export { CanvasErrorBoundary };
