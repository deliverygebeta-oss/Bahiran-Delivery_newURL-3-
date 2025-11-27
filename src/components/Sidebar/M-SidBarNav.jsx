import {useState, useEffect} from 'react'
import { useNavigation } from '../../contexts/NavigationContext';
import DashboardLayout from '../../Layouts/dashboardLayout';
import Order from '../../pages/M-DemoPages/Order';
import Menu from '../../pages/M-DemoPages/menus';
import Analytics from '../../pages/M-DemoPages/Analytics';
import Settings from '../../pages/M-DemoPages/Settings';
import Customers from '../../pages/M-DemoPages/customers';
import DashBoardPage from '../../pages/DashBoardPage';
import BalancePage from '../../pages/M-DemoPages/withdraw';
const ManagerNav = () => {
  const { activeNav } = useNavigation();
  // console.log(activeNav)
  const [activeComponent, setActiveComponent] = useState(null);
  const [chengOrder , setChengOrder] = useState(false);


  useEffect(() => {
    switch (activeNav) {
      case 'Dashboard':
        setActiveComponent(<DashBoardPage />);
        break;
      case 'Orders':
        setActiveComponent(<Order chengOrder={chengOrder} setChengOrder={setChengOrder} />);
        break;
      case 'Menu':
        setActiveComponent(<Menu />);
        break;
      case 'Customers':
        setActiveComponent(<Customers />);
        break;
      case 'Analytics':
        setActiveComponent(<Analytics />);
        break;
      case 'Settings':
        setActiveComponent(<Settings />);
        break;
      case 'Balance':
        setActiveComponent(<BalancePage />);
        break;
      default:
        setActiveComponent(null);
    }
  }, [activeNav]);

  return (
    <DashboardLayout>
   
   {activeComponent}
    </DashboardLayout>
  );
};

export default ManagerNav;
