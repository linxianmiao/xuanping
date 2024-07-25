import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import stores from './stores'
import Drawer from '~/components/drawer'
import Header from './header'
import Content from './content'
import Filters from './filters'

import './styles/index.less'

class Search extends Component {
  static defaultProps = {
    visible: false,
    onClose: () => {}
  }

  render() {
    const { visible, onClose } = this.props

    return (
      <Provider {...stores}>
        <Drawer
          className="search-drawer"
          // width={630}
          contentWrapperStyle={{width: 630}}
          placement="left"
          visible={visible}
          closeIcon={false}
          onClose={onClose}
        >
          <div className="search-drawer-body">
            <div className="search-drawer-body-left">
              <h3>{i18n('filter.mode', '筛选方式')}</h3>
              <Filters />
            </div>
            <div className="search-drawer-body-right">
              <Header />
              <Content onClose={onClose} />
            </div>
          </div>
        </Drawer>
      </Provider>
    )
  }
}

export default Search