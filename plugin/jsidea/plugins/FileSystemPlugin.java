package jsidea.plugins;

import java.util.HashMap;

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
import org.json.JSONObject;

public class FileSystemPlugin extends BasePlugin {
	private static final String JAVA_EDITOR_ID = "org.eclipse.jdt.internal.ui.javaeditor.JavaEditor"; //$NON-NLS-1$

	@Override
	public void init() {

	}

	public Object openFile(JSONObject options) {

		String filename = options.getString("file");
		int lineNumber = options.getInt("line-number");

		final IFile file = javaFileToPluginFile(filename);

		if (file != null) {
			// it seems that file is in the workspace

			final IWorkbench workbench = PlatformUI.getWorkbench();
			workbench.getDisplay().syncExec(new Runnable() {
				@Override
				public void run() {
					final IWorkbenchWindow activeWorkbenchWindow = workbench.getActiveWorkbenchWindow();
					final IWorkbenchPage page = activeWorkbenchWindow.getActivePage();

					openInEditor(page, file, lineNumber);
				}
			});

			return null;
		}

		System.out.println("The file could not be found: " + filename);

		// String[] p = new String[1];
		// p[0] = "HELLO WORLD TO 1000";
		// return p;//new JSONObject("{'test' : 'hello world'}");//"The file
		// could not be found: " + filename;
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
				continue;

			if (javaFile.startsWith('/' + project.getName())) {
				javaFile = javaFile.substring(project.getName().length() + 1);
			}

			IFile file = project.getFile(javaFile);
			if (file.exists()) {
				return file;
			}
		}
		return null;
	}
}