/* eslint-disable no-console */
import { useEffect, useRef, useState, useCallback, RefObject } from 'react';

export type InfiniteRoot = Element | undefined | null;
export type InfiniteAnchor = Element | undefined | null;

type Observer = IntersectionObserver | undefined;

interface InfiniteLoadMore {
  // The callback function to execute when the threshold is exceeded.
  onLoadMore?: Function;

  // from 0 to 1. 1 means the anchor is 100% visable and 0.25 means 25% visable.
  onLoadThreshold?: number;
}

interface InfiniteRefresh {
  // The callback function to execute when the threshold is exceeded.
  onRefresh?: Function;

  // from 0 to 1. 1 means the anchor is 100% visable and 0.25 means 25% visable.
  onRefreshThreshold?: number;
}

export type InfiniteScrollArgs = InfiniteLoadMore & InfiniteRefresh;

function useInfiniteScroll<
  T extends Element,
  S extends Element,
  R extends Element
>({
  onLoadMore,
  onLoadThreshold = 1,
  onRefresh,
  onRefreshThreshold = 1,
}: InfiniteScrollArgs): [
  RefObject<T>,
  (instance: S | null) => void,
  (instance: R | null) => void
] {
  // The scrollable conponent and the observed targers
  const containerRef = useRef<T>(null);
  const onLoadAnchorRef = useRef<InfiniteAnchor>(null);
  const onRefreshAnchorRef = useRef<InfiniteAnchor>(null);

  const [loadObserver, setLoadObserver] = useState<Observer>(undefined);
  const [refreshObserver, setRefreshObserver] = useState<Observer>(undefined);

  // Flags that are used to skip the initialize run
  const isFirstOnLoad = useRef(true);
  const isFirstOnRefresh = useRef(true);

  // The method which is used to setup the onLoad target
  const onLoadAnchor = useCallback(
    (element: S | null) => {
      if (onLoadAnchorRef.current) {
        loadObserver?.unobserve(onLoadAnchorRef.current);
      }

      if (element && loadObserver) {
        isFirstOnLoad.current = true;
        loadObserver.observe(element);
      }

      onLoadAnchorRef.current = element;
    },
    [loadObserver]
  );

  // The method which is used to setup the refresh target
  const onRefreshAchor = useCallback(
    (element: R | null) => {
      if (onRefreshAnchorRef.current) {
        refreshObserver?.unobserve(onRefreshAnchorRef.current);
      }

      if (element && refreshObserver) {
        isFirstOnRefresh.current = true;
        refreshObserver.observe(element);
      }

      onRefreshAnchorRef.current = element;
    },
    [refreshObserver]
  );

  // Setup onLoadMore observer
  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    if (onLoadMore) {
      const options = {
        root: containerRef.current,
        rootMargin: '0px',
        threshold: onLoadThreshold,
      };

      observer = new IntersectionObserver(handleOnLoadMore, options);
      setLoadObserver(observer);

      if (onLoadAnchorRef.current) {
        isFirstOnLoad.current = true;
        observer.observe(onLoadAnchorRef.current);
      }
    }

    function handleOnLoadMore(entries: IntersectionObserverEntry[]) {
      function notifyAll() {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= onLoadThreshold
          ) {
            onLoadMore?.();
          }
        });
      }

      if (isFirstOnLoad.current) {
        isFirstOnLoad.current = false;
      } else {
        notifyAll();
      }
    }

    return () => observer?.disconnect();
  }, [onLoadMore, onLoadThreshold]);

  // Setup onRefrewsh observer
  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    if (onRefresh) {
      const options = {
        root: containerRef.current,
        rootMargin: '0px',
        threshold: onRefreshThreshold,
      };

      observer = new IntersectionObserver(handleOnRefresh, options);
      setRefreshObserver(observer);

      if (onRefreshAnchorRef.current) {
        isFirstOnRefresh.current = true;
        observer.observe(onRefreshAnchorRef.current);
      }
    }

    function handleOnRefresh(entries: IntersectionObserverEntry[]) {
      function notifyAll() {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= onRefreshThreshold
          ) {
            onRefresh?.();
          }
        });
      }

      if (isFirstOnRefresh.current) {
        isFirstOnRefresh.current = false;
      } else {
        notifyAll();
      }
    }
    return () => observer?.disconnect();
  }, [onRefresh, onRefreshThreshold]);

  return [containerRef, onLoadAnchor, onRefreshAchor];
}

export default useInfiniteScroll;
