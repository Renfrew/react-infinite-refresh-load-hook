import * as React from 'react';
import useInfiniteScroll from '../src';
import { renderHook } from '@testing-library/react-hooks';
import { render, fireEvent } from '@testing-library/react';

// NOTE: mock function are useless on the following tests bue it's neccessary.
// The library is depending on the intersection observer,
// which is brower specific
const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = jest
  .fn()
  .mockImplementation(intersectionObserverMock);

interface ListItemProps {
  id: string;
}

interface TestComponentProps {
  testContainer?: boolean;
  testLoad?: boolean;
  testRefresh?: boolean;
}

const ListItem = React.forwardRef(function listItem(props: ListItemProps, ref) {
  const { id } = props;

  return (
    <li
      ref={ref && null}
      style={{ border: '1px', padding: '8px', margin: '4px' }}
      id={id}
    >
      {id}
    </li>
  );
});

function TestComponent(props: TestComponentProps) {
  const { testContainer, testLoad, testRefresh } = props;

  const [data, setData] = React.useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const dataLength = React.useRef(0);

  // count the number of event calls.
  // onLoad is -1 because of initialize useEffect
  const onLoadCall = React.useRef(-1);
  const onRefreshCall = React.useRef(0);

  const handleLoadMore = React.useCallback(() => {
    onLoadCall.current += 1;
    const newArray: number[] = [];
    for (let i = 0; i < dataLength.current + 50; i++) {
      newArray.push(i);
    }
    dataLength.current += 50;
    setData(newArray);
  }, []);

  const handleRefresh = React.useCallback(() => {
    if (!isRefreshing) {
      onRefreshCall.current += 1;
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
      <ul
        style={{ overflow: 'scroll', height: '600px', width: '350px' }}
        ref={testContainer ? infiniteRef : null}
      >
        {data.map((_, idx) => {
          if (idx === 0) {
            return (
              <ListItem
                key={idx}
                ref={testRefresh ? onRefreshAnchorRef : null}
                id={`${idx}`}
              />
            );
          }
          if (idx === data.length - 2) {
            return (
              <ListItem
                key={idx}
                ref={testLoad ? onLoadAnchorRef : null}
                id={`${idx}`}
              />
            );
          }
          return <ListItem key={idx} id={`${idx}`} />;
        })}
      </ul>
      <div id="refresh">{isRefreshing ? 'refreshing' : 'no-refreshing'}</div>
      <div id="load">loading</div>
      <div id="length">{data.length}</div>
      <div id="onLoadCall">{onLoadCall.current}</div>
      <div id="onRefreshCall">{onRefreshCall.current}</div>
    </React.Fragment>
  );
}

describe('create the hook without crashing', () => {
  it('no argument', () => {
    const { result } = renderHook(() => useInfiniteScroll({}));
    expect(result.current.length).toBe(3);
  });

  it('set onLoad', () => {
    const { container } = render(<TestComponent testLoad />);

    const onLoadCallDiv = container.querySelector('#onLoadCall');
    expect(onLoadCallDiv?.innerHTML).toBe('0');
  });

  it('set onRefresh', () => {
    const { container } = render(<TestComponent testRefresh />);

    const onRefreshCallDiv = container.querySelector('#onRefreshCall');
    expect(onRefreshCallDiv?.innerHTML).toBe('0');
  });
});

describe('test functionalities', () => {
  it('onLoad without container', () => {
    const { container } = render(<TestComponent testLoad />);

    // Initiallized data length
    const dataLengthDiv = container.querySelector('#length');
    expect(dataLengthDiv?.innerHTML).toBe('50');

    const onLoadCallDiv = container.querySelector('#onLoadCall');
    expect(onLoadCallDiv?.innerHTML).toBe('0');

    // Note: require intersection observer, but now it is empty mocked
    fireEvent.scroll(window);

    expect(dataLengthDiv?.innerHTML).toBe('50');
    expect(onLoadCallDiv?.innerHTML).toBe('0');
  });

  it('onRefresh without container', () => {
    const { container } = render(<TestComponent testRefresh />);

    // Initiallized data length
    const dataLengthDiv = container.querySelector('#length');
    expect(dataLengthDiv?.innerHTML).toBe('50');

    const onRefreshCallDiv = container.querySelector('#onRefreshCall');
    expect(onRefreshCallDiv?.innerHTML).toBe('0');

    // Note: require intersection observer, but now it is empty mocked
    fireEvent.scroll(window);

    expect(onRefreshCallDiv?.innerHTML).toBe('0');
  });
});
