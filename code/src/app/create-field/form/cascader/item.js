import React, { Component } from 'react'
import { Input, Button } from '@uyun/components'
import { PlusOutlined, CopyOutlined, DeleteOutlined } from '@uyun/icons'
import ItemWrap from './itemWrap'
import uuidv4 from 'uuid/v4'
import { ArrowUpOutlined, ArrowDownOutlined } from '@uyun/icons'

class Item extends Component {
  onChange = (item, i) => {
    const data = _.cloneDeep(this.props.item)
    data.children[i] = item
    this.props.onChange(data, this.props.index)
  }

  onDelete = (index, parantIndex) => {
    const item = _.cloneDeep(this.props.item)
    item.children.splice(index, 1)
    this.props.onChange(item, parantIndex)
  }

  onValue = (value, index) => {
    const item = _.cloneDeep(this.props.item)
    item.children[index].label = value
    this.props.onChange(item, this.props.index)
  }

  add = (item, i) => {
    item.children = item.children || []
    item.children.push({ label: '', value: uuidv4(), select: 0, children: [] })
    const data = _.cloneDeep(this.props.item)
    data.children[i] = item
    this.props.onChange(data, this.props.index)
  }

  copy = (item, i) => {
    const _item = _.cloneDeep(this.props.item)
    _item.children = _item.children
      .slice(0, i + 1)
      .concat({ label: '', value: uuidv4(), select: 0, children: [] })
      .concat(_item.children.slice(i + 1))
    this.props.onChange(_item, this.props.index)
  }

  moveUp = (index, parantIndex) => {
    const data = _.cloneDeep(this.props.item)
    const item = _.cloneDeep(data.children[index - 1])
    const item2 = _.cloneDeep(data.children[index])
    data.children[index - 1] = item2
    data.children[index] = item
    this.props.onChange(data, parantIndex)
  }

  moveDown = (index, parantIndex) => {
    const data = _.cloneDeep(this.props.item)
    const item = _.cloneDeep(data.children[index + 1])
    const item2 = _.cloneDeep(data.children[index])
    data.children[index] = item
    data.children[index + 1] = item2
    this.props.onChange(data, parantIndex)
  }

  render() {
    const { item, level, total, onAdd, index, parantIndex, onCopy, onMoveUp, onMoveDown } =
      this.props
    const { children, label } = item

    return (
      <div className={`options-item-item level-${level}`}>
        <span className="options-item-level">{level}</span>
        <Input
          size="small"
          style={{ width: '200px' }}
          value={label}
          className="options-item-input"
          placeholder={i18n(`cascader-placeholder-${level}`)}
          onChange={(e) => {
            this.props.onValue(e.target.value, index)
          }}
        />
        {level !== 6 && (
          <Button
            size="small"
            onClick={() => {
              onAdd(level, index)
            }}
          >
            <PlusOutlined />
          </Button>
        )}
        <Button size="small" icon={<CopyOutlined />} onClick={() => onCopy(level, index)} />
        {!(total === 1 && level === 1) && (
          <Button
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => this.props.onDelete(index, parantIndex)}
          />
        )}
        {index !== 0 && total > 1 && (
          <ArrowUpOutlined onClick={() => onMoveUp(index, parantIndex)} />
        )}
        {index !== total - 1 && total > 1 && (
          <ArrowDownOutlined onClick={() => onMoveDown(index, parantIndex)} />
        )}
        {children &&
          children.length > 0 &&
          _.map(children, (item, i) => {
            const nextLevel = level + 1
            return (
              <ItemWrap
                total={children.length}
                level={nextLevel}
                item={item}
                index={i}
                key={i}
                parantIndex={index}
                onChange={this.onChange}
                onDelete={this.onDelete}
                onAdd={() => {
                  this.add(item, i)
                }}
                onCopy={() => {
                  this.copy(item, i)
                }}
                onMoveUp={this.moveUp}
                onMoveDown={this.moveDown}
                onValue={this.onValue}
              />
            )
          })}
      </div>
    )
  }
}

export default Item
