import React from 'react'
import { Observer } from 'mobx-react'
import useStores from '~/hooks/useStores'
import FormManagement from '~/form-management'
import FieldList from '~/field-list/merged'
import DictionaryList from '~/system/dictionary'

export default () => {
  const { lowcodeStore } = useStores()

  return (
    <Observer>
      {() => {
        const { appDataKey } = lowcodeStore

        switch (appDataKey) {
          case 'form_list':
            return <FormManagement />
          case 'field_list':
            return <FieldList />
          case 'dictionary_list':
            return <DictionaryList />
          default:
            return null
        }
      }}
    </Observer>
  )
}
