package jsidea.plugins;

import java.io.File;
import java.util.HashMap;

import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IMarker;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IRegion;
import org.eclipse.ui.IEditorPart;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.IWorkbenchWindow;
import org.eclipse.ui.PartInitException;
import org.eclipse.ui.PlatformUI;
import org.eclipse.ui.ide.IDE;
import org.eclipse.ui.texteditor.ITextEditor;
import org.json.JSONObject;

public class Editor extends BasePlugin {
	private static final String JAVA_EDITOR_ID = "org.eclipse.jdt.internal.ui.javaeditor.JavaEditor"; //$NON-NLS-1$

	@Override
	public void init() {

	}

	public Object _openFile(JSONObject options) throws Exception {
		String filename = options.getString("file");
		if (options.has("line-number"))
			return this.openFile(filename, options.getInt("line-number"));
		return this.openFile(filename);
	}

	public Object openFile(String filename) throws Exception {
		return this.openFile(filename, 1);
	}

	public Object openFile(String filename, int lineNumber) throws Exception {
		final IFile file = getEclipseFile(filename);
		if (file != null) {
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

		File f = new File(filename);
		if (!f.exists())
			throw new Exception("File not found: " + filename);

		// SOURCE:
		// https://github.com/marook/eclipse-remote-control/blob/master/workspaces/erc/com.github.marook.eclipse_remote_control.run/src/com/github/marook/eclipse_remote_control/run/runner/impl/simple/atom/OpenFileCommandRunner.java
		final IFileStore fileStore = EFS.getLocalFileSystem().getStore(f.toURI());
		final IWorkbench workbench = PlatformUI.getWorkbench();
		workbench.getDisplay().syncExec(new Runnable() {
			@Override
			public void run() {
				final IWorkbenchWindow activeWorkbenchWindow = workbench.getActiveWorkbenchWindow();
				final IWorkbenchPage page = activeWorkbenchWindow.getActivePage();

				try {
					IEditorPart part = IDE.openEditorOnFileStore(page, fileStore);
					goToLine(part, lineNumber);
				} catch (final PartInitException e) {
					e.printStackTrace();
				}
			}
		});

		return null;
	}

	// SOURCE:
	// http://stackoverflow.com/questions/2873879/eclipe-pde-jump-to-line-x-and-highlight-it
	private void goToLine(IEditorPart editorPart, int lineNumber) {
		if (!(editorPart instanceof ITextEditor) || lineNumber <= 1) {
			return;
		}
		// lineNumber--;
		ITextEditor editor = (ITextEditor) editorPart;

		IDocument document = editor.getDocumentProvider().getDocument(editor.getEditorInput());
		if (document != null) {
			IRegion lineInfo = null;
			try {
				lineInfo = document.getLineInformation(lineNumber - 1);
			} catch (org.eclipse.jface.text.BadLocationException e) {
				e.printStackTrace();
			}
			if (lineInfo != null) {
				editor.selectAndReveal(lineInfo.getOffset(), lineInfo.getLength());
			}
		}
	}

	// SOURCE:
	// http://logback.qos.ch/dist/ch.qos.logback.eclipse_1.1.0.zip
	private void openInEditor(IWorkbenchPage page, IFile file, int lineNumber) {
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

	private IFile getEclipseFile(String filename) {
		for (IProject project : ResourcesPlugin.getWorkspace().getRoot().getProjects()) {
			if (!project.isOpen())
				continue;

			if (filename.startsWith('/' + project.getName())) {
				filename = filename.substring(project.getName().length() + 1);
			}

			IFile file = project.getFile(filename);
			if (file.exists()) {
				return file;
			}
		}
		return null;
	}
}