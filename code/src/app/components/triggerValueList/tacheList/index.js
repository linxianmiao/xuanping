import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import { Dropdown, Tag } from '@uyun/components'
import Tab from './tab'
import _ from 'lodash'
import styles from './index.module.less'

// 转换服务端数据
const parseModelAndActivityData = (data = []) => {
  const valueList = []
  _.forEach(data, item => {
    const { modelId, modelName } = item
    _.forEach(item.tacheInfoVos, tache => {
      const { activityId, activityName } = tache
      valueList.push({ modelId, modelName, activityId, activityName })
    })
  })
  return valueList
}

// 获取valueList的name或id
const getValueListNameOrId = (valueList, type) => {
  return valueList.map(item => {
    const { modelId, modelName, activityId, activityName } = item
    return type === 'id' ? { modelId, activityId } : { modelName, activityName }
  })
}

@inject('modelListStore')
@observer
export default class TacheList extends Component {
  static propTypes = {
    value: PropTypes.array,
    handleChange: PropTypes.func
  }

  state = {
    valueList: [], // [{modelId: '', modelName: '', activityId: '', activityName: ''}]
    currentModelId: '',
    visible: false
  }

  async componentDidMount() {
    const { value } = this.props
    if (!_.isEmpty(value)) {
      const res = await this.props.modelListStore.getModelAndActivityInfo(value) || []
      this.setState({ valueList: parseModelAndActivityData(res || []) })
    }
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value && !_.isEmpty(nextProps.value)) {
      const res = await this.props.modelListStore.getModelAndActivityInfo(nextProps.value) || []
      this.setState({ valueList: parseModelAndActivityData(res || []) })
    }
  }

  componentDidUpdate(nextProps) {
    if (this.props.comparison !== nextProps.comparison) {
      this.setState({ valueList: [] })
    }
  }

  handleChangeValueList = (data, type) => {
    const { comparison } = this.props
    let valueList = []
    if (comparison === 'CONTAINS' || comparison === 'NOTCONTAINS') {
      valueList = _.xorWith(this.state.valueList, data, _.isEqual)
    } else {
      valueList = type === 'delete' ? [] : data
      this.onVisibleChange(false)
    }
    this.setState({ valueList })
    const value = getValueListNameOrId(valueList, 'id')
    this.props.handleChange(value)
  }

  onVisibleChange = (visible) => {
    this.setState({ visible })
  }

  render () {
    const { valueList, visible } = this.state
    const { disabled } = this.props
    return (
      <div>
        <Dropdown
          disabled={disabled}
          visible={visible}
          onVisibleChange={this.onVisibleChange}
          overlay={
            <Tab
              {...this.props}
              valueList={valueList}
              handleChangeValueList={this.handleChangeValueList} />
          }
        >
          <div className={styles.similarInput}>
            {
              valueList.length === 0
                ? <span className={styles.placeholder}>{i18n('globe.select', '请选择')}</span>
                : valueList.map(item => {
                  if (!item.activityId) return
                  const title = `${item.modelName}/${item.activityName}`
                  return (
                    <Tag key={item.activityId} closable onClose={e => {
                      e.stopPropagation()
                      this.handleChangeValueList([item], 'delete')
                    }} style={{ marginBottom: 2 }}>
                      <span title={title}>{title}</span>
                    </Tag>
                  )
                })
            }
          </div>
        </Dropdown>
      </div>
    )
  }
}
