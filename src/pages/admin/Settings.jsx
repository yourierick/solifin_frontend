import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import TransactionFeeSettings from './components/TransactionFeeSettings';
import { useTheme } from '../../contexts/ThemeContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Settings = () => {
  const { isDarkMode } = useTheme();
  const [isEmailNotificationEnabled, setIsEmailNotificationEnabled] = useState(true);
  const [password, setPassword] = useState('');

  return (
    <div className="bg-white dark:bg-[#1e283b] text-gray-900 dark:text-white rounded-lg shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Paramètres du système</h1>
        
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-800/20 p-1 dark:bg-gray-700/20">
            <Tab className={({ selected }) => classNames(
              'w-full py-3 text-sm font-medium rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white dark:bg-gray-800 shadow text-primary-700 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] dark:hover:bg-gray-700/[0.8] hover:text-primary-600 dark:hover:text-primary-400'
            )}>
              FRAIS DE TRANSACTION
            </Tab>
            <Tab className={({ selected }) => classNames(
              'w-full py-3 text-sm font-medium rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white dark:bg-gray-800 shadow text-primary-700 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] dark:hover:bg-gray-700/[0.8] hover:text-primary-600 dark:hover:text-primary-400'
            )}>
              PARAMÈTRES GÉNÉRAUX
            </Tab>
            <Tab className={({ selected }) => classNames(
              'w-full py-3 text-sm font-medium rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white dark:bg-gray-800 shadow text-primary-700 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] dark:hover:bg-gray-700/[0.8] hover:text-primary-600 dark:hover:text-primary-400'
            )}>
              NOTIFICATIONS
            </Tab>
            <Tab className={({ selected }) => classNames(
              'w-full py-3 text-sm font-medium rounded-lg',
              'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 ring-white ring-opacity-60',
              selected
                ? 'bg-white dark:bg-gray-800 shadow text-primary-700 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] dark:hover:bg-gray-700/[0.8] hover:text-primary-600 dark:hover:text-primary-400'
            )}>
              SÉCURITÉ
            </Tab>
          </Tab.List>

          <Tab.Panels className="mt-2">
            <Tab.Panel>
              <div className="rounded-lg bg-white p-4 dark:bg-[#1e283b] dark:text-white">
                <TransactionFeeSettings />
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="rounded-lg bg-white p-4 dark:bg-[#1e283b] dark:text-white">
                <h2 className="text-xl font-semibold mb-4">Paramètres généraux</h2>
                <div className="space-y-4">
                  
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="rounded-lg bg-white p-4 dark:bg-[#1e283b] dark:text-white">
                <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                <div className="space-y-4">
                  
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="rounded-lg bg-white p-4 dark:bg-[#1e283b] dark:text-white">
                <h2 className="text-xl font-semibold mb-4">Sécurité</h2>
                <div className="space-y-4">
                  
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Settings;
