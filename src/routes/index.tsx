import { Routes, Route } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { adminRoutes } from './adminRoutes';
import { staffRoutes } from './staffRoutes';
import { developerRoutes } from './developerRoutes';
import { clientManagerRoutes } from './clientManagerRoutes';
import { clientRoutes } from './clientRoutes';

export default function AppRoutes() {
  return (
    <Routes>
      {publicRoutes}
      {adminRoutes}
      {staffRoutes}
      {developerRoutes}
      {clientManagerRoutes}
      {clientRoutes}
    </Routes>
  );
}
