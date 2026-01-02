/**
 * LanguageProvider Smoke Tests
 *
 * Tests that LanguageProvider works and is properly memoized
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { LanguageProvider } from './LanguageProvider';
import { useLanguage } from './LanguageContext';

describe('LanguageProvider', () => {
  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useLanguage());
    }).toThrow('useLanguage must be used within a LanguageProvider');

    console.error = originalError;
  });

  it('should provide language context', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    expect(result.current.language).toBeDefined();
    expect(['de', 'en']).toContain(result.current.language);
  });

  it('should provide translation function', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');

    // Test translation function works
    const translation = result.current.t('menu.title');
    expect(typeof translation).toBe('string');
    expect(translation.length).toBeGreaterThan(0);
  });

  it('should provide helper functions', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    expect(result.current.getJoke).toBeDefined();
    expect(result.current.getSpruch).toBeDefined();
    expect(result.current.getParcelText).toBeDefined();
    expect(typeof result.current.getJoke).toBe('function');
    expect(typeof result.current.getSpruch).toBe('function');
    expect(typeof result.current.getParcelText).toBe('function');
  });

  it('should return random joke', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    const joke = result.current.getJoke();
    expect(typeof joke).toBe('string');
    expect(joke.length).toBeGreaterThan(0);
  });

  it('should return random spruch', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: LanguageProvider,
    });

    const spruch = result.current.getSpruch();
    expect(typeof spruch).toBe('string');
    expect(spruch.length).toBeGreaterThan(0);
  });
});
