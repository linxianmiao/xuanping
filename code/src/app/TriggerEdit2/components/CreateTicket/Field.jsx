import React from 'react'
import { Col } from '@uyun/components'
import SingleRowText from '~/ticket/forms/singleRowText'
import MultiRowText from '~/ticket/forms/multiRowText'
import SingleSel from '~/ticket/forms/singleSel'
import MultiSel from '~/ticket/forms/multiSel'
import ListSel from '~/ticket/forms/listSel'
import Int from '~/ticket/forms/int'
import Double from '~/ticket/forms/double'
import DateTime from '~/ticket/forms/dateTime'
import User from '~/ticket/forms/user'
import Cascader from '~/ticket/forms/cascader'
import RichText from '~/ticket/forms/richText'
import Department from '~/ticket/forms/department'
import SecurityCode from '~/ticket/forms/securityCode'
import TimeInterval from '~/ticket/forms/timeInterval'

const Field = ({ field = {}, value, index, ...rest }) => {
  const { code, type } = field

  const renderContent = () => {
    const fieldProps = {
      field,
      source: 'trigger',
      disabled: field.isRequired === 2,
      initialValue: value !== undefined ? value : field.defaultValue,
      ...rest
    }

    switch (type) {
      case 'singleRowText':
      case 'flowNo':
        return <SingleRowText {...fieldProps} />
      case 'multiRowText':
        return <MultiRowText {...fieldProps} />
      case 'singleSel':
        return <SingleSel {...fieldProps} />
      case 'multiSel':
        return <MultiSel {...fieldProps} />
      case 'listSel':
      case 'business':
        return <ListSel {...fieldProps} />
      case 'int':
        return <Int {...fieldProps} />
      case 'double':
        return <Double {...fieldProps} />
      case 'dateTime':
        return <DateTime {...fieldProps} />
      case 'user':
        return <User {...fieldProps} />
      case 'cascader':
        return <Cascader {...fieldProps} />
      case 'richText':
        return <RichText {...fieldProps} />
      case 'department':
        return <Department {...fieldProps} />
      case 'securityCode':
        return <SecurityCode {...fieldProps} />
      case 'timeInterval':
        return <TimeInterval {...fieldProps} />
      default:
        return null
    }
  }

  const Content = renderContent()

  if (Content) {
    if (index % 2 === 0) {
      ;<>
        <Col span={12}>{Content}</Col>
        <Col span={24} />
      </>
    }
    return <Col span={12}>{Content}</Col>
  }

  return null
}

export default Field
