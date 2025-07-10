import { useEffect, useRef } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = <T extends HTMLElement>(
  callback: (entry: IntersectionObserverEntry) => void,
  options: UseIntersectionObserverOptions = {}
) => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry);
            if (options.triggerOnce) {
              observer.unobserve(element);
            }
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback, options.threshold, options.rootMargin, options.triggerOnce]);

  return elementRef;
};

// Hook pour l'animation automatique des éléments text-appear
export const useAnimateOnScroll = () => {
  const ref = useIntersectionObserver<HTMLDivElement>(
    (entry) => {
      entry.target.classList.add('appear');
    },
    { threshold: 0.1, triggerOnce: true }
  );

  return ref;
};