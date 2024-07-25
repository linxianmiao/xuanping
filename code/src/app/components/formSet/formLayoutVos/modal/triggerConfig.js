import React, { Component } from 'react'
import update from 'immutability-helper'
import uuidV4 from '~/utils/uuid'
import { PlusOutlined } from '@uyun/icons'
import { Button, Collapse } from '@uyun/components'
import Rules from './rules'

export default class TriggerConfig extends Component {
  constructor(props) {
    super(props)
    let linkageStrategyVos = []
    if (_.isEmpty(props.linkageStrategyVos)) {
      linkageStrategyVos = [this.getInitlinkageStrategy()]
    } else {
      linkageStrategyVos = props.linkageStrategyVos
    }
    this.state = {
      linkageStrategyVos,
      activeKey: linkageStrategyVos[0].cid
    }
  }

  getInitlinkageStrategy = () => {
    if (this.props.linkSource === 'group') {
      return {
        cid: uuidV4(),
        changeContent: [{ type: 'visible' }],
        conditionExpressions: [],
        initialValue: false
      }
    }
    return {
      cid: uuidV4(),
      changeContent: [],
      conditionExpressions: [],
      initialValue: false
    }
  }

  addCustomScript = () => {
    const { linkageStrategyVos } = this.state
    this.setState({
      linkageStrategyVos: [...linkageStrategyVos, this.getInitlinkageStrategy()]
    })
  }

  handleDelete = (index) => {
    const { linkageStrategyVos } = this.state
    this.setState({
      linkageStrategyVos: _.filter(linkageStrategyVos, (item, idx) => idx !== index)
    })
  }

  moveUp = (index, e) => {
    e.stopPropagation()
    const { linkageStrategyVos } = this.state
    const temp = linkageStrategyVos[index]
    this.setState({
      linkageStrategyVos: update(linkageStrategyVos, {
        $splice: [
          [index, 1],
          [index - 1, 0, temp]
        ]
      })
    })
  }

  moveDown = (index, e) => {
    e.stopPropagation()
    const { linkageStrategyVos } = this.state
    const temp = linkageStrategyVos[index]
    this.setState({
      linkageStrategyVos: update(linkageStrategyVos, {
        $splice: [
          [index, 1],
          [index + 1, 0, temp]
        ]
      })
    })
  }

  changeActiveKey = (activeKey) => {
    this.setState({ activeKey })
  }

  // handleChange = (value, type, id) => {
  //   const { linkageStrategyVos } = this.state
  //   this.setState({
  //     linkageStrategyVos: _.map(linkageStrategyVos, item => {
  //       if (item.cid === id) {
  //         return _.assign({}, item, { [type]: value })
  //       }
  //       return item
  //     })
  //   })
  // }
  handleChange = (value, id) => {
    const { linkageStrategyVos } = this.state
    const nextLinkageStrategyVos = _.map(linkageStrategyVos, (item) => {
      return item.cid === id ? { ...value } : item
    })

    this.setState({ linkageStrategyVos: nextLinkageStrategyVos })
  }

  getExtra = (index, length) => {
    return (
      <div className="header">
        {index !== 0 && (
          <i className="iconfont icon-shangyi" onClick={(e) => this.moveUp(index, e)} />
        )}
        {index !== length - 1 && (
          <i className="iconfont icon-xiayi" onClick={(e) => this.moveDown(index, e)} />
        )}
        <i className="iconfont icon-shanchu" onClick={(e) => this.handleDelete(index, e)} />
      </div>
    )
  }

  getName = (changeContent) => {
    const name = _.map(changeContent, (content) => {
      switch (content.type) {
        case 'visible':
          return i18n('conf.model.linkage.strategy.tip1', '可见性')
        case 'checkIn':
          return i18n('conf.model.linkage.strategy.tip2', '基础检验')
        case 'changeValue':
          return i18n('conf.model.linkage.strategy.tip3', '值改变')
        case 'asyncValue':
          return i18n('conf.model.linkage.strategy.tip4', '动态值')
        case 'dateTime':
          return i18n('time.validate', '时间校验')
        default:
          return null
      }
    })
    if (_.isEmpty(_.compact(name))) {
      return i18n('conf.model.linkage.strategy.tip12', '联动策略')
    } else {
      return name.toString()
    }
  }

  render() {
    const { field, allFields, linkSource } = this.props
    const { linkageStrategyVos, activeKey } = this.state
    const length = linkageStrategyVos.length
    return (
      <div className="form-set-field-script">
        <Collapse activeKey={activeKey} onChange={this.changeActiveKey}>
          {_.map(linkageStrategyVos, (item, index) => {
            const { changeContent, cid } = item
            return (
              <Collapse.Panel
                key={cid}
                header={this.getName(changeContent)}
                extra={this.getExtra(index, length)}
              >
                <Rules
                  cid={cid}
                  item={item}
                  field={field}
                  allFields={allFields}
                  linkSource={linkSource}
                  handleChange={this.handleChange}
                />
              </Collapse.Panel>
            )
          })}
        </Collapse>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ marginTop: 10 }}
          onClick={this.addCustomScript}
        >
          {i18n('conf.model.linkage.strategy.tip11', '添加策略')}
        </Button>
      </div>
    )
  }
}
