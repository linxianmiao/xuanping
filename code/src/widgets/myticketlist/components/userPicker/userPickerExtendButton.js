import React, { Component } from 'react';
import { getTootipTitle, ArrayTypeToObjectKey, EXTEND_LIST } from './config';
import { Tooltip, Button } from '@uyun/components';

export default class UserPickerExtendButton extends Component {
  handleCurrent = (tabs) => {
    const { value, onChange } = this.props;
    const tab = _.head(tabs);
    const key = ArrayTypeToObjectKey(tab);
    const { users, groups, departs } = value;
    const currentData = _.find(EXTEND_LIST, (item) => item.type === tab);
    let falt = false;
    // 防止多次点击
    switch (tab) {
      case 0:
        falt = _.some(groups, (group) => group.groupId === 'currentGroup');
        break;
      case 1:
        falt = _.some(users, (user) => user.userId === 'currentUser');
        break;
      case 2:
        falt = _.some(departs, (depart) => depart.id === 'currentDepart');
        break;
      default:
        falt = false;
    }

    // 防止多次点击
    if (falt) {
      return false;
    }
    onChange(_.assign({}, value, { [key]: [...value[key], currentData] }));
  };

  render() {
    const { tabs, extendFunc = [], size = 'default', disabled } = this.props;
    return (
      _.includes(extendFunc, 'current') && (
        <Tooltip title={getTootipTitle(tabs)}>
          <Button
            onClick={() => {
              this.handleCurrent(tabs);
            }}
            disabled={disabled}
            size={size}
          >
            <i className="iconfont icon-yonghu" />
          </Button>
        </Tooltip>
      )
    );
  }
}
