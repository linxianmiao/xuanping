import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Input } from '@uyun/components'
import styles from './index.module.less'
import classnames from 'classnames'
@inject('modelListStore')
@observer
export default class Tache extends Component {
  state = {
    list: [],
    kw: undefined
  }

  componentDidMount() {
    this.getList(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentModelId !== nextProps.currentModelId) {
      this.getList(nextProps)
    }
  }

  getList = async (props) => {
    const { currentModelId } = props
    const res = await this.props.modelListStore.queryActivityInfos({ modelId: currentModelId })
    this.setState({ list: res })
  }

  handleSerch = (e) => {
    this.setState({ kw: e.target.value })
  }

  handleChange = (item) => {
    this.props.handleChangeValueList({ activityId: item.id, activityName: item.name })
  }

  render () {
    const { valueList } = this.props
    const { list, kw } = this.state
    const filterList = kw ? _.filter(list, item => item.name.indexOf(kw) !== -1) : list
    return (
      <div>
        <Input.Search
          allowClear
          value={kw}
          style={{ width: 256, marginBottom: 10 }}
          placeholder={i18n('globe.keywords', '请输入关键字')}
          onChange={this.handleSerch}
        />
        <ul className={styles.lazyModelWrap}>
          {_.map(filterList, (item, index) => {
            return (
              <li
                key={item.id}
                onClick={() => { this.handleChange(item) }}
                className={classnames({
                  active: _.some(valueList, v => v.activityId === item.id)
                })}
              >{item.name}</li>
            )
          })}
        </ul>
      </div>
    )
  }
}
