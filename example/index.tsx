import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';

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
  const boxRef = React.createRef<HTMLUListElement>();
  const anchorRef = React.createRef<HTMLLIElement>();
  const [observer, setObserver] = React.useState<IntersectionObserver>();
  const [data, setData] = React.useState<Item[]>([]);

  React.useEffect(() => {
    let newArray: Item[] = [];
    for (let i = 0; i < 50; i++) {
      const newItem = {
        key: i,
        value: `This is item ${i}`,
      };
      newArray = [...newArray, newItem];
    }
    setData(newArray);

    const options = {
      root: boxRef.current,
      rootMargin: '0px',
      threshold: 1,
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    setObserver(observer);

    function handleIntersect(entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio === 1) {
          // eslint-disable-next-line no-console
          console.warn('HERE');
          window.alert(entry.target.id);
        }
      });
    }
  }, []);

  React.useEffect(() => {
    anchorRef.current && observer?.observe(anchorRef.current);

    return () => {
      anchorRef.current && observer?.unobserve(anchorRef.current);
    };
  }, [anchorRef]);

  return (
    <React.Fragment>
      <h1>Infinite List</h1>
      <h3>Created by using “react-infinite-refresh-load-hook”</h3>
      <Scrollable ref={boxRef} id="box">
        {data.map((item, idx) => {
          if (idx === data.length - 2) {
            return (
              <ListItem key={item.key} ref={anchorRef} id={`item${item.key}`}>
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
