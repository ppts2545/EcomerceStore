import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

	private final String uploadDir = "backend/uploads";

	@PostMapping("/logo")
	public ResponseEntity<?> uploadLogo(@RequestParam("file") MultipartFile file) {
		if (file.isEmpty()) {
			return ResponseEntity.badRequest().body("No file selected");
		}
		try {
			String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
			String filename = "logo-" + UUID.randomUUID() + (ext != null ? "." + ext : "");
			Path uploadPath = Paths.get(uploadDir);
			if (!Files.exists(uploadPath)) {
				Files.createDirectories(uploadPath);
			}
			Path filePath = uploadPath.resolve(filename);
			file.transferTo(filePath);
			String publicUrl = "/uploads/" + filename;
			return ResponseEntity.ok().body(publicUrl);
		} catch (IOException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed");
		}
	}
}
