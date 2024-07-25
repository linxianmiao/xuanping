import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SingleRowText from './singleRowText'
import DateTime from './dateTime'
import Cascader from './cascader'
import TreeSel from './treeSel'
import MultiSel from './multiSel'
import SingleSel from './singleSel'
import Users from './users'
import MultiRowText from './multiRowText'
import TacheList from './tacheList'
import ModelList from './modelList'
import Tags from './tags'
import JSONText from './JSONText'
import TimeInterval from './timeInterval'
import _ from 'lodash'
class TriggerValueList extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    type: PropTypes.string,
    conditionList: PropTypes.array,
    handleChange: PropTypes.func
  }

  _render = () => {
    const {
      conditionList,
      comparsionType,
      comparison,
      value,
      handleChange,
      disabled,
      selectedField,
      logics = []
    } = this.props
    const dillver = {
      value,
      handleChange,
      params: conditionList,
      comparison,
      disabled,
      comparsionType,
      selectedField,
      logics
    }
    switch (comparsionType) {
      case 'cascader':
        return <Cascader {...dillver} />
      case 'treeSel':
        return <TreeSel {...dillver} />
      case 'multiSel':
        return <MultiSel {...dillver} />
      case 'dateTime':
        if (_.includes(['EARLIERTHANNOW', 'LATERTHANNOW'], comparison)) {
          return <TimeInterval {...dillver} />
        }
        return <DateTime {...dillver} />
      case 'int':
      case 'double':
      case 'flowNo':
      case 'singleRowText':
        return <SingleRowText {...dillver} />
      case 'multiRowText':
        return <MultiRowText {...dillver} />
      case 'user':
      case 'group':
      case 'role':
      case 'department':
        return <Users {...dillver} type={comparsionType} />
      case 'listSel':
      case 'business':
      case 'singleSel':
        if (_.includes(['EQUALS', 'NOTEQUALS'], comparison)) {
          return <SingleSel {...dillver} />
        } else {
          return <MultiSel {...dillver} />
        }
      case 'modelAndTache':
        return <TacheList {...dillver} />
      case 'modelList':
        return (
          <ModelList
            {...dillver}
            mode={_.includes(['EQUALS', 'NOTEQUALS'], comparison) ? '' : 'multiple'}
          />
        )
      case 'tags':
        return <Tags {...dillver} />
      case 'jsontext':
        return <JSONText {...dillver} />
      default:
        return null
    }
  }

  render() {
    return this._render()
  }
}

export default TriggerValueList
