/* eslint-disable react/prop-types,react/no-unused-state */
import AppBar from '@material-ui/core/AppBar';
import * as Colors from '@material-ui/core/colors';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Toolbar from '@material-ui/core/Toolbar';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions/actions';
import InfoToolBar from '../components/AppBarComponent/InfoToolBar';
import MainDrawer from '../components/AppBarComponent/MainDrawer';
import DashBoardComponent from '../components/Dashboard/DashBoardComponent';
import LicenseExpireNotification from '../components/HelperComponent/LicenseExpireNotification';
import NewMachineDialog from '../components/HelperComponent/NewMachineDialog';
import OpenDialog from '../components/HelperComponent/OpenDialog';
import SaveAsDialog from '../components/HelperComponent/SaveAsDialog';
import ErrorDialog from '../components/ImportExport/ErrorDialog';
import ImportDialog from '../components/ImportExport/ImportDialog';
import StartImportDialog from '../components/ImportExport/StartImportDialog';
import MachineDeleteDialog from '../components/MachineControlBar/MachineDeleteDialog';
import NotificationsComponent from '../components/NotificationsComponent/NotificationsComponent';
import RequestStatusDialog from '../components/RequestStatusDialog/RequestStatusDialog';
import ServerStatusDialog from '../components/ServerStatusDialog/ServerStatusDialog';
import SettingsMenu from '../components/SettingsMenu/SettingsMenu';
import AlertDialog from '../components/SheetDialogs/AlertDialog';
import DecisionDialog from '../components/SheetDialogs/DecisionDialog';
import { intl } from '../helper/IntlGlobalProvider';
import MachineHelper from '../helper/MachineHelper';
import HelpButton from '../layouts/HelpButton';
import theme from '../theme';

const DASHBOARD_QUERY = `
query Machines($scope: ScopeInput!) {
	scoped(scope: $scope) {
		machines {
			name
			id
			metadata {
				lastModified
				owner
			}
			previewImage
			titleImage
			streamsheets {
				name
				inbox {
					stream {
						name
					}
				}
			}
			state
		}
	}
}
`;

const useExperimental = (setAppState) => {
	useEffect(() => setAppState({ experimental: localStorage.getItem('experimental') === 'true' }), []);
};

export function DashboardPageComponent(props) {
	const { user, isConnected } = props;

	const scopeId = user ? user.scope.id : null;

	useExperimental(props.setAppState);

	useEffect(() => {
		if (!isConnected) {
			props.connect();
		}
	}, [isConnected]);

	useEffect(() => {
		if (isConnected) {
			props.getMe();
		}
	}, [isConnected]);

	useEffect(() => {
		if (scopeId) {
			props.getMachines(DASHBOARD_QUERY, { scope: { id: scopeId } });
		}
	}, [scopeId]);

	document.title = intl.formatMessage({ id: 'TitleDashboard' }, {});

	if (!user) {
		return (
			<MuiThemeProvider theme={theme}>
				<RequestStatusDialog />
				<ServerStatusDialog noStreams />
				<ErrorDialog />
			</MuiThemeProvider>
		);
	}
	return (
		<MuiThemeProvider theme={theme}>
			<div
				style={{
					height: 'inherit',
					width: 'inherit'
				}}
			>
				<div>
					<ImportDialog />
					<StartImportDialog />
					<NewMachineDialog />
					<OpenDialog />
					<SaveAsDialog />
					<MachineDeleteDialog />
					<MainDrawer />
					<AlertDialog />
					<DecisionDialog />
					<RequestStatusDialog />
					<ServerStatusDialog noStreams/>
					<ErrorDialog />
					<AppBar
						style={{
							background: props.isMachineEngineConnected ? Colors.blue[800] : Colors.red[900],
							display: 'flex',
							margin: 0,
							padding: 0,
							position: 'relative'
						}}
					>
						<div
							style={{
								display: 'flex',
								flexDirection: 'row',
								height: '58px'
							}}
						>
							<LicenseExpireNotification />
							<InfoToolBar title={<FormattedMessage id="Dashboard" defaultMessage="Dashboard" />} workspaceSelect />
							{!props.isMachineEngineConnected ? (
								<div>
									<FormattedMessage id="ServicesDisconnected" defaultMessage="Disconnected: " />
									{`${props.disconnectedServices}`}
								</div>
							) : null}
							<Toolbar
								style={{
									paddingRight: '5px',
									minHeight: '58px'
								}}
							>
								<NotificationsComponent />
								<HelpButton />
								<SettingsMenu />
							</Toolbar>
						</div>
					</AppBar>
				</div>
				<div
					style={{
						position: 'relative',
						height: 'calc(100% - 59px)',
						width: '100%',
						overflow: 'hidden',
						backgroundColor: '#EEEEEE'
					}}
				>
					<DashBoardComponent />
				</div>
			</div>
		</MuiThemeProvider>
	);
}

function mapStateToProps(state) {
	return {
		isConnected: state.monitor.isConnected,
		isMachineEngineConnected: MachineHelper.isMachineEngineConnected(state.monitor, state.meta),
		user: state.user.user,
		disconnectedServices: state.meta.disconnectedServices.join(', ')
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ ...Actions }, dispatch);
}

export const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(DashboardPageComponent);
