import React, { Component } from 'react'
import { observer } from 'mobx-react'
import TicketHeader from './components/TicketHeader'
import TicketTable from './components/TicketTable'
import { inject } from '@uyun/core'
import styles from './todolist.module.less'
@observer
export default class TodoList extends Component {
  @inject('i18n') i18n
  @inject('listStore') listStore

  componentDidMount() {
    this.listStore.getTicketPriority()
    this.listStore.getList()
    this.listStore.startFormDataReaction()
  }

  componentWillUnmount() {
    this.listStore.reset()
  }

  render() {
    return (
      <div id="rebuild-todolist-wrap" className={styles.itsmTodolist}>
        <TicketHeader />
        <TicketTable />
      </div>
    )
  }
}
