import { RefObject, useEffect, useRef, useState } from 'react';

export type InfiniteRoot = Element | undefined | null;
export type InfiniteAnchor = RefObject<Element> | undefined | null;

type Observer = IntersectionObserver | undefined;

interface InfiniteRootArg {
  // The container that is scrollable, default to window
  container?: InfiniteRoot;
}

interface InfiniteLoadMore extends InfiniteRootArg {
  // The callback function to execute when the threshold is exceeded.
  onLoadMore?: Function;

  // The target element to calculate the threshold.
  onLoadAnchor?: InfiniteAnchor;

  // from 0 to 1. 1 means the anchor is 100% visable and 0.25 means 25% visable.
  onLoadThreshold?: number;
}

interface InfiniteRefresh extends InfiniteRootArg {
  // The callback function to execute when the threshold is exceeded.
  onRefresh?: Function;

  // The target element to calculate the threshold.
  onRefreshAnchor?: InfiniteAnchor;

  // from 0 to 1. 1 means the anchor is 100% visable and 0.25 means 25% visable.
  onRefreshThreshold?: number;
}

export type InfiniteScrollArgs = InfiniteLoadMore & InfiniteRefresh;

function useInfiniteScroll<T extends Element>({
  container,
  onLoadMore,
  onLoadAnchor,
  onLoadThreshold = 1,
  onRefresh,
  onRefreshAnchor,
  onRefreshThreshold = 1,
}: InfiniteScrollArgs) {
  const ref = useRef<T>(null);
  const [loadObserver, setLoadObserver] = useState<Observer>(undefined);
  const [refreshObserver, setRefreshObserver] = useState<Observer>(undefined);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    if (onLoadMore) {
      const options = {
        root: container || ref.current,
        rootMargin: '0px',
        threshold: onLoadThreshold,
      };

      observer = new IntersectionObserver(handleOnLoadMore, options);
      setLoadObserver(observer);
    }

    function handleOnLoadMore(entries: IntersectionObserverEntry[]) {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= onLoadThreshold) {
          onLoadMore?.();
        }
      });
    }

    return () => observer?.disconnect();
  }, [container, onLoadMore, onLoadThreshold]);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    if (onRefresh) {
      const options = {
        root: container || ref.current,
        rootMargin: '0px',
        threshold: onRefreshThreshold,
      };

      observer = new IntersectionObserver(handleOnRefresh, options);
      setRefreshObserver(observer);
    }

    function handleOnRefresh(entries: IntersectionObserverEntry[]) {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= onRefreshThreshold) {
          onRefresh?.();
        }
      });
    }
    return () => observer?.disconnect();
  }, [container, onRefresh, onRefreshThreshold]);

  // Update onLoadMore observers
  useEffect(() => {
    let cleanupElement: Element | null;
    if (onLoadAnchor && onLoadAnchor.current) {
      loadObserver?.observe(onLoadAnchor.current);
      cleanupElement = onLoadAnchor.current;
    }

    return () => {
      if (cleanupElement) {
        loadObserver?.unobserve(cleanupElement);
      }
    };
  }, [loadObserver, onLoadAnchor]);

  useEffect(() => {
    let cleanupElement: Element | null;
    if (onRefreshAnchor && onRefreshAnchor.current) {
      refreshObserver?.observe(onRefreshAnchor.current);
      cleanupElement = onRefreshAnchor.current;
    }

    return () => {
      if (cleanupElement) {
        refreshObserver?.unobserve(cleanupElement);
      }
    };
  }, [refreshObserver, onRefreshAnchor]);

  return ref;
}

export default useInfiniteScroll;
