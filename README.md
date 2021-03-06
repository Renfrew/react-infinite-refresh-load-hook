# react-infinite-refresh-load-hook

A react hook that allow you to inifinite scrolling.
it support both loadmore and refresh in either direction.

`useInfiniteScroll` hook uses [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Threholds) to monitor the visability of the
anchor elements. As long as a anchor element is visable on the container,
the handler of that anchor will be called.

## Install

```bash
  npm i react-infinite-refresh-load-hook

  or

  yarn add react-infinite-refresh-load-hook

  // ES6
  import useInfiniteScroll from 'react-infinite-refresh-load-hook'
  // or commonjs
  var useInfiniteScroll = require('react-infinite-refresh-load-hook');
```

## Demo

[The Site](https://react-infinite-refresh-load-hook.netlify.app/)

[Source Code](https://github.com/Renfrew/react-infinite-refresh-load-hook-demo)

[![Edit yk7637p62z](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flamboyant-brahmagupta-69mys)

## Using

```jsx
const App = () => {
  const handleLoadMore = React.useCallback(() => {
    ...
  }, []);

  const handleRefresh = React.useCallback(() => {
    ...
  }, []);

  const [infiniteRef, onLoadAnchorRef, onRefreshAnchorRef] = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    onRefresh: handleRefresh,
  });

  return (
    <React.Fragment>
      {/* Set the container ref, which is scrollable */}
      {/* if this is not set, it will default to window */}
      <ul ref={infiniteRef}>
        {data.map((_, idx) => {
          if (idx === 0) {
            return (
              <li
                key={idx}
                // Set the ref of element that will fire Refresh
                // when it is visable on the container
                ref={onRefreshAnchorRef}
              >
                {idx}
              </li>
            );
          }
          if (idx === data.length - 2) {
            return (
              <li
                key={idx}
                // Set the ref of element that will fire loadMore
                // when it is visable on the container
                ref={onLoadAnchorRef}
              >
                {item.value}
              </li>
            );
          }
          return (
            <li key={idx}>{idx}</li>
          );
        })}
      </Scrollable>
    </React.Fragment>
  );
};
```

## Props

- **onLoadMore:** will be call if `onLoadAnchorRef` is passed to an element and the element is visable on the container.
- **onLoadThreshold:** From 0 to 1 [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Threholds)
- **onRefresh:** will be call if `onRefreshAnchorRef` is passed to an element and the element is visable on the container.
- **onRefreshThreshold:** From 0 to 1. [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Threholds)
