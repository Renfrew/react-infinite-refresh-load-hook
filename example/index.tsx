/* eslint-disable no-console */
import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import useInfiniteScroll from '../src';

interface Item {
  key: number;
  value: string;
}

const Scrollable = styled.ul`
  list-style: none;
  overflow: scroll;
  height: 600px;
  width: 350px;
  background-color: grey;
`;

const ListItem = styled.li`
  background-color: #fafafa;
  border: 1px solid #99b4c0;
  padding: 8px;
  margin: 4px;
`;

const App = () => {
  const [data, setData] = React.useState<Item[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const dataLength = React.useRef(0);

  const handleLoadMore = React.useCallback(() => {
    const newArray: Item[] = [];
    for (let i = 0; i < dataLength.current + 50; i++) {
      newArray.push({
        key: i,
        value: `This is item ${i}`,
      });
    }
    dataLength.current += 50;
    setData(newArray);
  }, []);

  const handleRefresh = React.useCallback(() => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 3000);
    }
  }, [isRefreshing]);

  const [infiniteRef, onLoadAnchorRef, onRefreshAnchorRef] = useInfiniteScroll<
    HTMLUListElement,
    HTMLLIElement,
    HTMLLIElement
  >({
    onLoadMore: handleLoadMore,
    onRefresh: handleRefresh,
  });

  React.useEffect(() => {
    handleLoadMore();
  }, [handleLoadMore]);

  return (
    <React.Fragment>
      <h1>Infinite List</h1>
      <h3>Created by using “react-infinite-refresh-load-hook”</h3>
      <Scrollable ref={infiniteRef} id="box">
        {isRefreshing && <div>Refreshing</div>}
        {data.map((item, idx) => {
          if (idx === 0) {
            return (
              <ListItem
                key={item.key}
                ref={onRefreshAnchorRef}
                id={`item${item.key}`}
              >
                {item.value}
              </ListItem>
            );
          }
          if (idx === data.length - 2) {
            return (
              <ListItem
                key={item.key}
                ref={onLoadAnchorRef}
                id={`item${item.key}`}
              >
                {item.value}
              </ListItem>
            );
          }
          return (
            <ListItem key={item.key} id={`item${item.key}`}>
              {item.value}
            </ListItem>
          );
        })}
      </Scrollable>
    </React.Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
