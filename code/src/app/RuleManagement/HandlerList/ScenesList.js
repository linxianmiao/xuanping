import React, { Component } from 'react'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@uyun/icons'
import { Menu, message } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import ScenesEdit from './ScenesEdit'
import styles from './index.module.less'

const { SubMenu, MenuList, Item: MenuItem } = Menu
@inject('handleRuleStore')
@observer
export default class ScenesList extends Component {
  state = {
    scenes: null
  }

  onClick = ({ item, key, keyPath }) => {
    const { ruleQuery } = this.props.handleRuleStore
    this.props.handleRuleStore.setData({ ruleQuery: _.assign({}, ruleQuery, { sceneId: key }) })
  }

  onSearch = (value) => {
    this.props.handleRuleStore.setData({
      scenesQuery: { kw: value, type: 'HANDLER_RULE' }
    })
  }

  onAdd = () => {
    this.setState({ scenes: { type: 'HANDLER_RULE' } })
  }

  onEdit = (scenes) => {
    this.setState({ scenes })
  }

  onDelete = async (scenes) => {
    const res = await this.props.handleRuleStore.deleteRuleScene(scenes.id)
    if (+res === 200) {
      message.success(i18n('delete_success', '删除成功'))
      this.onSearch(undefined)
      this.props.getRuleScenes()
    }
  }

  onOk = async (values) => {
    const { scenes } = this.state
    const res = await this.props.handleRuleStore.saveRuleScene(
      _.assign({}, values, _.pick(scenes, ['id', 'type']))
    )
    if (+res === 200) {
      const mes = scenes.id
        ? i18n('ticket.from.update.sucess', '更新成功')
        : i18n('save_success', '保存成功')
      message.success(mes)
      this.onSearch(undefined)
      this.props.getRuleScenes()
      this.setState({ scenes: null })
    }
    return res
  }

  onCancel = () => {
    this.setState({ scenes: null })
  }

  render() {
    const { scenesList, scenesQuery, ruleQuery } = this.props.handleRuleStore
    const { scenes } = this.state
    const { kw } = scenesQuery
    const { sceneId } = ruleQuery
    return (
      <aside className={styles.scenesList}>
        <MenuList
          showSearch
          title="规则管理"
          selectedKeys={[sceneId]}
          searchValue={kw}
          onSearch={this.onSearch}
          onClick={this.onClick}
          searchPlaceholder={i18n('ticket.list.screent.kw', '请输入关键字')}
          extra={<PlusOutlined onClick={this.onAdd} />}
        >
          <MenuItem key="all">{'全部规则'}</MenuItem>
          <MenuItem key="0">{'未分类规则'}</MenuItem>
          {!_.isEmpty(scenesList) && (
            <SubMenu title="已分类规则包">
              {_.map(scenesList, (item) => {
                return (
                  <MenuItem
                    showExtra="hover"
                    title={item.name}
                    key={item.id}
                    extra={
                      <span>
                        <EditOutlined
                          onClick={() => {
                            this.onEdit(item)
                          }}
                        />
                        <DeleteOutlined
                          onClick={() => {
                            this.onDelete(item)
                          }}
                        />
                      </span>
                    }
                  >
                    {item.name}
                  </MenuItem>
                )
              })}
            </SubMenu>
          )}
        </MenuList>
        <ScenesEdit scenes={scenes} onOk={this.onOk} onCancel={this.onCancel} />
      </aside>
    )
  }
}
