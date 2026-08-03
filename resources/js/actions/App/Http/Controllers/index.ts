import DashboardController from './DashboardController'
import ActivityLogController from './ActivityLogController'
import UserManagementController from './UserManagementController'
import CenterController from './CenterController'
import DriverController from './DriverController'
import GuideController from './GuideController'
import GuideImageController from './GuideImageController'
import DownloadSupportCasesController from './DownloadSupportCasesController'
import SupportCaseController from './SupportCaseController'
import Settings from './Settings'
const Controllers = {
    DashboardController: Object.assign(DashboardController, DashboardController),
ActivityLogController: Object.assign(ActivityLogController, ActivityLogController),
UserManagementController: Object.assign(UserManagementController, UserManagementController),
CenterController: Object.assign(CenterController, CenterController),
DriverController: Object.assign(DriverController, DriverController),
GuideController: Object.assign(GuideController, GuideController),
GuideImageController: Object.assign(GuideImageController, GuideImageController),
DownloadSupportCasesController: Object.assign(DownloadSupportCasesController, DownloadSupportCasesController),
SupportCaseController: Object.assign(SupportCaseController, SupportCaseController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers
