import { BarChart2, UserMinus, X } from 'lucide-react'
import React from 'react'

const stats = () => {
  return (
    <div>
        <div className={`absolute top-20 right-4 w-80 p-4 rounded-lg shadow-lg
            ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center">
                <BarChart2 size={18} className="mr-2 text-blue-500" />
                Statistiques Familiales
              </h3>
              <button 
                onClick={() => setShowStats(false)}
                className={`p-1 rounded-full hover:bg-opacity-20 transition-colors
                  ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              >
                <X size={18} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Personnes</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Générations</span>
                  <span className="font-semibold">{stats.generations}</span>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Hommes</span>
                  <span className="font-semibold text-blue-500">{stats.males}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Femmes</span>
                  <span className="font-semibold text-pink-500">{stats.females}</span>
                </div>
                {stats.others > 0 && (
                  <div className="flex justify-between mt-1">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Autre</span>
                    <span className="font-semibold text-gray-500">{stats.others}</span>
                  </div>
                )}
              </div>
              
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Vivants</span>
                  <span className="font-semibold text-green-500">{stats.living}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Décédés</span>
                  <span className="font-semibold text-gray-500">{stats.deceased}</span>
                </div>
              </div>
              
              {stats.oldestPerson && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Personne la plus âgée</span>
                    <button 
                      className="text-blue-500 hover:underline"
                      onClick={() => handleNodeClick(stats.oldestPerson)}
                    >
                      Voir
                    </button>
                  </div>
                  <div className="mt-1 font-semibold">
                    {stats.oldestPerson.name} ({stats.oldestPerson.birthYear})
                  </div>
                </div>
              )}
              
              {stats.youngestPerson && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Personne la plus jeune</span>
                    <button 
                      className="text-blue-500 hover:underline"
                      onClick={() => handleNodeClick(stats.youngestPerson)}
                    >
                      Voir
                    </button>
                  </div>
                  <div className="mt-1 font-semibold">
                    {stats.youngestPerson.name} ({stats.youngestPerson.birthYear})
                  </div>
                </div>
              )}
    
              {/* Problèmes de cohérence */}
              {consistencyIssues.length > 0 && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-50'}`}>
                  <div className="flex items-center mb-2">
                    <UserMinus size={16} className="mr-2 text-red-500" />
                    <span className={`font-semibold ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                      Problèmes de cohérence ({consistencyIssues.length})
                    </span>
                  </div>
                  <ul className={`text-sm space-y-1 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                    {consistencyIssues.slice(0, 3).map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                    {consistencyIssues.length > 3 && (
                      <li>...et {consistencyIssues.length - 3} autres problèmes</li>
                    )}
                  </ul>
                </div>
              )}
              
              {consistencyIssues.length === 0 && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'}`}>
                  <div className="flex items-center">
                    <UserCheck size={16} className="mr-2 text-green-500" />
                    <span className={`font-semibold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                      Données cohérentes
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
    </div>
  )
}

export default stats
