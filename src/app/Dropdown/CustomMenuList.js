"use client";

import React from "react";
import PropTypes from "prop-types";
import { FixedSizeList as List } from "react-window";

const DefaultItemHeight = 40;

export default class CustomMenuList extends React.Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    children: PropTypes.node.isRequired,
    maxHeight: PropTypes.number.isRequired,
    getValue: PropTypes.func.isRequired,
  };

  renderItem = ({ index, style }) => {
    const { children } = this.props;
    const childrenArray = React.Children.toArray(children);

    return (
      <li style={style} key={index}>
        {childrenArray[index]}
      </li>
    );
  };

  render() {
    const { options, children, maxHeight, getValue } = this.props;
    const [value] = getValue();

    const initialOffset = options.indexOf(value) * DefaultItemHeight;
    const childrenOptions = React.Children.toArray(children);
    const wrapperHeight =
      maxHeight < childrenOptions.length * DefaultItemHeight
        ? maxHeight
        : childrenOptions.length * DefaultItemHeight;

    return (
      <span className="react-virtualized-list-wrapper">
        <List
          height={wrapperHeight + 6}
          width="100%"
          itemCount={childrenOptions.length}
          itemSize={DefaultItemHeight}
          initialScrollOffset={initialOffset}
        >
          {this.renderItem}
        </List>
      </span>
    );
  }
}
