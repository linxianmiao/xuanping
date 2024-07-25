import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Input, Button, Tag, Popover, Spin } from '@uyun/components'

@inject('formSetGridStore')
@observer
export default class ExternalURL extends Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
    this.state = {
      position: 0,
      loading: false
    }
  }

  handleClick = (code) => {
    const { value = '', onChange } = this.props
    const { position } = this.state
    const prev = value.slice(0, position)
    const next = value.slice(position)
    const val = prev + '${ticket.' + code + '}' + next
    onChange(val)
  }

  getParameter = async () => {
    const { getParameter, parameter } = this.props.formSetGridStore
    if (_.isEmpty(parameter)) {
      this.setState({ loading: true })
      getParameter()
      this.setState({ loading: false })
    }
  }

  render() {
    const { value, onChange } = this.props
    const { parameter } = this.props.formSetGridStore
    const { loading } = this.state
    const content = _.map(parameter, item => <Tag style={{ marginBottom: 10 }} onClick={() => { this.handleClick(item.code) }} key={item.code}>{item.name}</Tag>)
    return (
      <div className="card-url">
        <Input
          value={value}
          ref={this.inputRef}
          placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('conf.model.field.card.url', '外部url')}`}
          onBlur={() => {
            this.setState({
              position: this.inputRef.current.input.selectionStart
            })
          }}
          onChange={e => {
            onChange(e.target.value)
          }}
        />
        <Popover
          placement="bottom"
          trigger={['click']}
          overlayStyle={{ width: 300 }}
          content={loading ? <Spin /> : content}>
          <Button onClick={this.getParameter}><i className="icon-code iconfont" /></Button>
        </Popover>
      </div>
    )
  }
}
