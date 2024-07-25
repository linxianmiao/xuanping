import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { DeleteOutlined, PlusOutlined } from '@uyun/icons';
import { Button, Icon } from '@uyun/components'
import Form from './Form'
import styles from './index.module.less'

@inject('triggerStore')
@observer
class CreateTicket extends Component {
  static defaultProps = {
    value: [],
    onChange: () => {}
  }

  componentDidMount() {
    const { value } = this.props
    const { models, getModelsByUser } = this.props.triggerStore

    if (value && value.length > 0) {
      value.forEach(() => {
        this.props.triggerStore.pushCreateTicketFormRef(React.createRef())
      })
    }
    if (models.length === 0) {
      getModelsByUser()
    }
  }

  handleAdd = () => {
    const { value, onChange } = this.props
    const nextValue = [...(value || [])]
    nextValue.push(undefined)
    onChange(nextValue)

    this.props.triggerStore.pushCreateTicketFormRef(React.createRef())
  }

  handleDelete = index => {
    const { value, onChange } = this.props
    const nextValue = [...(value || [])]
    nextValue.splice(index, 1)
    onChange(nextValue)

    this.props.triggerStore.quitCreateTicketFormRef(index)
  }

  renderItem = (item, index) => {
    const { createTicketFormRefs } = this.props.triggerStore

    return (
      <div key={index + ''} className={styles.formWrapper}>
        <p>{`批次${index + 1}`}</p>
        <DeleteOutlined onClick={() => this.handleDelete(index)} />
        <Form ref={createTicketFormRefs[index]} value={item} />
      </div>
    );
  }

  render() {
    const { value } = this.props

    return (
      <div>
        {Array.isArray(value) ? value.map(this.renderItem) : null}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={this.handleAdd}
        >
          添加批次
        </Button>
      </div>
    );
  }
}

export default CreateTicket
