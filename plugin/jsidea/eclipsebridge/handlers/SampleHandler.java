package jsidea.eclipsebridge.handlers;

import java.util.HashMap;

import org.eclipse.core.commands.AbstractHandler;
import org.eclipse.core.commands.ExecutionEvent;
import org.eclipse.core.commands.ExecutionException;
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IMarker;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.IWorkbenchWindow;
import org.eclipse.ui.PartInitException;
import org.eclipse.ui.PlatformUI;
import org.eclipse.ui.ide.IDE;

/**
 * Our sample handler extends AbstractHandler, an IHandler base class.
 * 
 * @see org.eclipse.core.commands.IHandler
 * @see org.eclipse.core.commands.AbstractHandler
 */
public class SampleHandler extends AbstractHandler {
	private static final String JAVA_EDITOR_ID = "org.eclipse.jdt.internal.ui.javaeditor.JavaEditor"; //$NON-NLS-1$

	/**
	 * The constructor.
	 */
	public SampleHandler() {
	}

	/**
	 * the command has been executed, so extract extract the needed information
	 * from the application context.
	 */
	public Object execute(ExecutionEvent event) throws ExecutionException {
		

//		String filename = "G:/software/xampp-portable/htdocs/eventfive/wfb/sixcms_template_checkout_dir/bo-framework/sites/wfb/components/views/wfb_navigation_v1_v_d.cmst";
		String filename = "/wfb/sixcms_template_checkout_dir/bo-framework/sites/wfb/components/views/wfb_navigation_v1_v_d.cmst";
		final IFile file = javaFileToPluginFile(filename);
		
//		String res = "AHH: ";
//		if(file == null)
//			res += "FILE NOT FOUND: " + filename;
		
//		String projects = "";
//		for (IProject project : ResourcesPlugin.getWorkspace().getRoot().getProjects()) {
//			projects += project.getName();
//		}
		
//		IWorkbenchWindow window = HandlerUtil.getActiveWorkbenchWindowChecked(event);
//		MessageDialog.openInformation(window.getShell(), "EclipseBridge", res + projects);
		
		
		if (file != null){
			// it seems that file is in the workspace
			
			final IWorkbench workbench = PlatformUI.getWorkbench();
		    workbench.getDisplay().syncExec(new Runnable() {
				@Override
				public void run() {
					final IWorkbenchWindow activeWorkbenchWindow =
						workbench.getActiveWorkbenchWindow();
					final IWorkbenchPage page =
				    	activeWorkbenchWindow.getActivePage();
				 
				    openInEditor(page, file, 100);
				}
			});
		    
		    return null;
		}

		return null;
	}

	// this method comes from
	// http://logback.qos.ch/dist/ch.qos.logback.eclipse_1.1.0.zip
	private static void openInEditor(IWorkbenchPage page, IFile file, int lineNumber) {
		final HashMap<String, Object> map = new HashMap<String, Object>();
		map.put(IMarker.LINE_NUMBER, new Integer(lineNumber));
		map.put(IDE.EDITOR_ID_ATTR, JAVA_EDITOR_ID);
		try {
			final IMarker marker = file.createMarker(IMarker.TEXT);
			marker.setAttributes(map);
			IDE.openEditor(page, marker);
			marker.delete();
		} catch (PartInitException e) {
			e.printStackTrace();
		} catch (CoreException e) {
			e.printStackTrace();
		}
	}

	private IFile javaFileToPluginFile(String javaFile) {
		for (IProject project : ResourcesPlugin.getWorkspace().getRoot().getProjects()) {
			if (!project.isOpen())
				continue; // TODO opening of project ??

			if (javaFile.startsWith('/' + project.getName())) {
				javaFile = javaFile.substring(project.getName().length() + 1);
			} 
			
//			else if (javaFile.startsWith("/")) { // absolute system path
//				final String projectPath = project.getLocation().toOSString();
//				if (javaFile.length() < projectPath.length())
//					continue;
//				javaFile = javaFile.substring(projectPath.length());
//			}
//
			IFile file = project.getFile(javaFile);
			if (file.exists()) {
				return file;
			}
		}
		return null;
	}
}
