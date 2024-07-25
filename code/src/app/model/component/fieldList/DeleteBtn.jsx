import React from 'react'
import { inject, observer } from 'mobx-react'
import { Tooltip } from '@uyun/components'
import { DownOutlined } from '@uyun/icons'
import cls from 'classnames'
import styles from './index.module.less'

@inject('modelFieldListStore')
@observer
class DeleteBtn extends React.Component {
  state = {
    visible: false,
    message: null,
    show: false
  }

  onVisibleChange = async (visible) => {
    const { canDelete } = this.props.row || {}

    if (canDelete) {
      return
    }

    this.setState({ visible })
  }

  handleChangeShowMessage = async () => {
    const { id } = this.props.row || {}
    const { message, show } = this.state

    if (_.isEmpty(message)) {
      const res = await this.props.modelFieldListStore.isDeleteField(id)
      this.setState({ message: res.message })
    }

    this.setState({ show: !show })
  }

  _renderName = (key) => {
    switch (key) {
      case 'model':
        return i18n('del-field-model', '关联模型')
      case 'trigger':
        return i18n('del-field-trigger', '关联触发器')
      case 'configTicket':
        return i18n('del-field-configTicket', '触发器设置工单')
      case 'sla':
        return i18n('del-field-sla', '关联SLA')
      case 'otherField':
        return i18n('del-field-otherField', '字段引用')
      default:
        return ''
    }
  }

  _renderTitle = () => {
    const { message, show } = this.state
    return (
      <div className={styles.tooltipTitle}>
        <p>
          <span>{i18n('del-field-tip', '不能直接删除关联中的字段')} </span>
          <span className={cls('icon-wrap', { messageShow: show })}>
            <DownOutlined onClick={this.handleChangeShowMessage} />
          </span>
        </p>
        {show && (
          <ul className={styles.tooltipTitleUl}>
            {_.map(message, (value, key) => {
              return (
                <li key={key}>
                  {this._renderName(key) + ' ：'}
                  <ul>
                    {_.map(value, (item, index) => {
                      const [name, code] = item.split('/')
                      return (
                        <li className={styles.liFlex} key={index}>
                          <span title={name} className="shenglue">
                            {name}
                          </span>
                          <span title={code} className="shenglue">
                            {code}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  render() {
    const { fieldDelete, row } = this.props
    const { visible } = this.state
    return fieldDelete ? (
      <Tooltip
        visible={visible}
        placement="bottom"
        mouseEnterDelay={0.5}
        title={this._renderTitle()}
        onVisibleChange={this.onVisibleChange}
      >
        <a
          onClick={
            row.canDelete
              ? () => {
                  this.props.handleDelete(row.id)
                }
              : () => {}
          }
          className={cls({ [styles.disabled]: !row.canDelete, [styles.delBtn]: true })}
        >
          {i18n('delete', '删除')}
        </a>
      </Tooltip>
    ) : null
  }
}

export default DeleteBtn
