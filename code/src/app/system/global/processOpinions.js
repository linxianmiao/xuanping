import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Button, Input, message, Title, Tag } from '@uyun/components'

import { toJS } from 'mobx'
import { observer } from 'mobx-react'
@observer
class ProcessOpinions extends Component {
    state = {
      visible: false,
      opinionValue: undefined
    }

    handleOptionChange = e => {
      const opinions = toJS(this.props.store.opinions)
      this.props.store.setOptions(_.assign({}, opinions, { value: { list: e } }))
    }

    handleClick = () => {
      this.setState({ visible: true })
    }

    handleOk = () => {
      const { opinionValue } = this.state
      if (_.isEmpty(_.trim(opinionValue))) {
        message.error(i18n('system.process.opinions.tip2', '自定义处理意见不能为空'))
        return false
      }
      const opinions = toJS(this.props.store.opinions)
      const { value = {} } = opinions
      const { list = [] } = value
      this.props.store.setOptions(_.assign({}, opinions, { value: { list: [].concat(list, opinionValue) } }))
      this.setState({
        visible: false,
        opinionValue: undefined
      })
    }

    render () {
      const { opinions } = this.props.store
      const { name, value = {} } = toJS(opinions)
      const { list = [] } = value
      const { visible, opinionValue } = this.state
      return (
        <div>
          <Title>
            {name}<span className="system-process-opinions-tip">{`(${i18n('system.process.opinions.tip1', '最多可配置6条快捷回复')})`}</span>
          </Title>
          <div className="system-config-global-group">
            <div className="ticket-opinions-wrap">
              {
                _.map(list, item => {
                  return (
                    <Tag closable onClose={() => {
                      const newList = list.filter(data => data !== item)
                      this.props.store.setOptions(_.assign({}, opinions, { value: { list: newList } }))
                    }}>
                      {item}
                    </Tag>
                  )
                })
              }
            </div>
            {visible && <div style={{ margin: '10px 0 20px 0' }}>
              <div className="ticket-opinions-input-wrap">
                <Input
                  value={opinionValue}
                  placeholder={i18n('system.process.opinions.tip', '请输入快捷回复')}
                  maxLength={30}
                  onChange={e => {
                    this.setState({ opinionValue: e.target.value })
                  }} />
              </div>
              <Button type="primary" style={{ marginLeft: 10 }}
                onClick={this.handleOk}><i className="icon-dui iconfont" /></Button>
              <Button onClick={() => {
                this.setState({
                  opinionValue: undefined,
                  visible: false
                })
              }} style={{ marginLeft: 10 }}><i className="icon-cha iconfont" /></Button>
            </div>}
            <Button disabled={list.length === 6} icon={<PlusOutlined />}onClick={this.handleClick}>{i18n('user_group_add', '添加')}</Button>
          </div>
        </div>
      );
    }
}
export default ProcessOpinions
