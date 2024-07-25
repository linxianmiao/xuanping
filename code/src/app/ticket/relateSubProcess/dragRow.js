import React from 'react'
import { Menu, Popconfirm, Modal, Tag, Button } from '@uyun/components'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import { HolderOutlined } from '@uyun/icons'
import Task from './task'

const chapterSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index
    }
  }
}

const chapterTarget = {
  hover(props, monitor, component) {
    if (!component) {
      return null
    }
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }
    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()
    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    // Determine mouse position
    const clientOffset = monitor.getClientOffset()
    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top
    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%
    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }
    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }
    // Time to actually perform the action
    props.moveTask(dragIndex, hoverIndex)
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex
  }
}

class DragRow extends React.Component {
  delSubTask = async (id, parentId) => {
    const res = await axios.get(API.deleteRelationTaskTicket, { params: { relationId: id } })
    // 删除后重新排序
    if (res) {
      // const { allData, dragSave } = this.props
      // const sortId = parentId || id
      // const newData = _.filter(allData, (d) => d.id !== sortId)
      // _.forEach(newData, (d, i) => {
      //   d.taskOrder = i + 1
      //   if (d.children && d.children.length > 0) {
      //     _.forEach(d.children, (child) => {
      //       child.taskOrder = i + 1
      //     })
      //   }
      // })
      // await dragSave(newData)
      this.props.getList()
    }
  }

  linkToDetail = (data) => {
    const { setDetailDrawer, showCreateSubTicketDrawer, data: parentData } = this.props
    if (data.taskDraftStatus === 1) {
      const subRoute = {
        location: {
          pathname: `/ticket/detail/${data.taskTicketId}`,
          search: `?tacheType=0&tacheNo=0&modelId=${data.taskModelId}&renderPager=false`
        },
        match: {
          params: { id: data.taskTicketId }
        }
      }
      setDetailDrawer(data.taskName, subRoute)
      // this.props.history.push(`/ticket/detail/${data.taskTicketId}`)
    } else {
      showCreateSubTicketDrawer(parentData, data.taskTicketId)
      // this.props.history.push(`/ticket/drafts/${data.taskTicketId}`)
    }
  }
  delGroup = (groupId) => {
    const { setData = () => {}, allData } = this.props
    const res = axios.get(API.delTaskGroup(groupId))
    if (res) {
      let data2 = _.cloneDeep(allData)
      const loop = (id, data) => {
        _.forEach(data, (d, i) => {
          if (d.groupId === id) {
            data.splice(i, 1)
          } else {
            loop(id, d.children)
          }
        })
      }
      loop(groupId, data2)
      setData(data2)
    }
  }
  showTip = (current) => {
    if (Array.isArray(current.children) && current.children.length > 0) {
      Modal.warning({
        title: '提示',
        content: '请先删除组内任务'
      })
    } else {
      Modal.confirm({
        title: '提示',
        content: '确认要删除组吗？',
        onOk: () => this.delGroup(current.groupId)
      })
    }
  }

  renderRow = (d) => {
    const { data } = this.props
    if (d.fieldCode === 'taskTicketNum' || d.fieldCode === 'taskName') {
      return (
        <div className="link-div">
          <a onClick={() => this.linkToDetail(data)}>{data[d.fieldCode]}</a>
        </div>
      )
    }
    if (d === 'taskOrder') {
      return ''
    }
    if (d.fieldType === 'ticket') {
      const value = data.formData[d.fieldCode]
      //字典下拉多选的情况
      if (Array.isArray(value) && _.has(value[0], 'label')) {
        let valueStr = _.map(value, (d) => d.label).join(',')
        return <div>{valueStr}</div>
      } else if (Array.isArray(value)) {
        return value.join(',')
      }
      //一般是下拉单选的情况
      if (Object.prototype.toString.call(value) === '[object Object]') {
        return value.label
      }
      return <div>{value}</div>
    }
    return <div>{data[d.fieldCode]}</div>
  }

  renderGroup = (data, index, level, number) => {
    const { showCreateSubTicketDrawer, disabled, scroll, addGroup } = this.props
    const { allowOperateDelete, groupId, groupType } = data
    let paddingL = 0
    if (level !== 1) {
      paddingL += 15 * (level - 1)
    }
    return (
      <div className={scroll ? 'sub-task-body scroll' : 'sub-task-body'}>
        <div className="space">
          <HolderOutlined />
        </div>
        <div className="group-sub" style={{ paddingLeft: paddingL }}>
          <span className={level === 1 ? '' : 'parallel-icon2'}>{number}</span>
          {groupType === 'parallel' ? (
            <Tag color="blue">并行组</Tag>
          ) : (
            <Tag color="green">串行组</Tag>
          )}
        </div>
        <div className="operation-subtask">
          <Button
            type="link"
            className="add-cub btn-link"
            disabled={disabled}
            onClick={() => {
              if (disabled) return
              let childrenLength = Array.isArray(data.children) ? data.children.length : 0
              let groupPriority = groupType === 'parallel' ? 1 : childrenLength + 1
              let type = groupType === 'parallel' ? 'serial' : 'parallel'
              addGroup(type, groupId, groupPriority, level)
            }}
          >
            添加组
          </Button>
          <Button
            type="link"
            className="add-cub btn-link"
            onClick={() => {
              if (disabled) return
              showCreateSubTicketDrawer(data)
            }}
            disabled={disabled}
          >
            {i18n('add-subtask')}
          </Button>
          <Button
            type="link"
            className="btn-link"
            onClick={() => {
              if (disabled || !allowOperateDelete) return
              this.showTip(data)
            }}
            disabled={disabled || !allowOperateDelete}
          >
            {i18n('delete')}
          </Button>
        </div>
      </div>
    )
  }

  renderLoopDom = (data, Index, level, number, parentData) => {
    const {
      moveTaskChild,
      columnList,
      showCreateSubTicketDrawer,
      history,
      disabled,
      allData,
      dragSave,
      scroll,
      setDetailDrawer
    } = this.props
    return (
      <>
        {_.map(data, (d2, i2) => {
          if (d2.elementType === 'group') {
            let number2 = d2.groupType === 'serial' ? `${number}` : `${number}.${i2 + 1}`
            if (d2.children && d2.children.length > 0) {
              return (
                <div>
                  {this.renderGroup(d2, i2, level + 1, number2)}
                  {this.renderLoopDom(d2.children, i2, level + 1, number2, d2)}
                </div>
              )
            }
            return this.renderGroup(d2, i2, level + 1, number2)
          } else {
            return (
              <Task
                key={d2.id}
                data={d2}
                parentData={parentData}
                allData={allData}
                moveTaskChild={moveTaskChild}
                parentIndex={Index}
                index={i2}
                id={d2.id}
                curlevel={level + 1}
                parentNumber={number}
                setDetailDrawer={setDetailDrawer}
                columnList={columnList}
                delSubTask={this.delSubTask}
                history={history}
                disabled={disabled}
                dragSave={dragSave}
                scroll={scroll}
                showCreateSubTicketDrawer={showCreateSubTicketDrawer}
              />
            )
          }
        })}
      </>
    )
  }

  render() {
    const {
      connectDragSource,
      connectDropTarget,
      isDragging,
      index,
      moveTaskChild,
      columnList,
      data,
      showCreateSubTicketDrawer,
      history,
      disabled,
      allData,
      dragSave,
      scroll,
      setDetailDrawer
    } = this.props
    const { taskOrder, allowOperateDelete } = data
    return connectDragSource(
      connectDropTarget(
        <div style={{ opacity: isDragging ? 0.2 : 1 }}>
          {data.elementType === 'group' ? (
            <div>
              {/* 因为初始初始执行顺序为并行，第一层永远是并行组下的，所以序号不会变，number总是1 */}
              {this.renderGroup(data, index, 1, 1)}
              {data.children &&
                data.children.length > 0 &&
                _.map(data.children, (d, i) => {
                  if (d.elementType === 'group') {
                    let number = d.groupType === 'serial' ? `${1}` : `${1}.${i + 1}`

                    if (d.children && d.children.length > 0) {
                      return (
                        <div>
                          {this.renderGroup(d, i, 2, number)}
                          {this.renderLoopDom(d.children, i, 2, number, d)}
                        </div>
                      )
                    }
                    return this.renderGroup(d, i, 2, number)
                  } else {
                    return (
                      <Task
                        key={d.id}
                        data={d}
                        parentData={data}
                        allData={allData}
                        moveTaskChild={moveTaskChild}
                        parentIndex={index}
                        index={i}
                        parentNumber={1}
                        curlevel={2}
                        id={d.id}
                        setDetailDrawer={setDetailDrawer}
                        columnList={columnList}
                        delSubTask={this.delSubTask}
                        history={history}
                        disabled={disabled}
                        dragSave={dragSave}
                        scroll={scroll}
                        showCreateSubTicketDrawer={showCreateSubTicketDrawer}
                      />
                    )
                  }
                })}
            </div>
          ) : (
            <div className={scroll ? 'sub-task-body scroll' : 'sub-task-body'}>
              <div className="space">
                <HolderOutlined />
              </div>
              {/* 因为初始初始执行顺序为并行，第一层永远是并行组下的，所以序号不会变，总是1 */}
              <div className="order">1</div>

              <div className="custom-columns">{_.map(columnList, (d) => this.renderRow(d))}</div>

              <div className="operation-subtask">
                <Popconfirm
                  disabled={disabled || !allowOperateDelete}
                  title={i18n('app.delete.content')}
                  onConfirm={() => this.delSubTask(data.id)}
                >
                  <a disabled={disabled || !allowOperateDelete}>{i18n('delete')}</a>
                </Popconfirm>
              </div>
            </div>
          )}
        </div>
      )
    )
  }
}

export default DropTarget('dragRow', chapterTarget, (connect, monitor) => ({
  isOver: monitor.isOver(),
  connectDropTarget: connect.dropTarget()
}))(
  DragSource('dragRow', chapterSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))(DragRow)
)
