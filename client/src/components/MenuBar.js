import React from 'react';
import {
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
} from 'mdb-react-ui-kit';

class MenuBar extends React.Component {
    render() {
        return(
         <MDBNavbar type="dark" theme="primary" expand="md">
        <MDBNavbarBrand href="/">Oscar Movie App</MDBNavbarBrand>
          <MDBNavbarNav navbar>
          <MDBNavbarItem>
              <MDBNavbarLink active href="/">
                Home
              </MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink active href="/quiz">
                Quiz
              </MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink active  href="/recommend" >
                Recommend
              </MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink active  href="/searchTitle" >
                Search Title
              </MDBNavbarLink>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBNavbarLink active  href="/searchCast" >
                Search Cast
              </MDBNavbarLink>
            </MDBNavbarItem>
          </MDBNavbarNav>
      </MDBNavbar>
        )
    }
}

export default MenuBar
