import { logger } from "../../common/constants";
import { test } from "../fixtures";
import { writeRequestDurationToFile } from "../helpers/report";
import { uploadSboms } from "../helpers/upload";

test.describe.configure({ mode: "serial" });

const SBOM_DIR = "../features/assets/performance/delete"; // The path is relative to the helpers/upload.ts file.
const SBOM_FILES = [
  "1_devspaces_pluginregistry-rhel8.json.bz2",
  "1_devspaces_server-rhel8.json.bz2",
  "1.46.0-26.el9_4-product.json.bz2",
  "1.46.0-26.el9_4-release.json.bz2",
  "1.46.0-27.el9_4-product.json.bz2",
  "1.46.0-27.el9_4-release.json.bz2",
  "3_quarkus-bom-3.2.6.Final-redhat-00002.json.bz2",
  "3_quarkus-bom-3.2.9.Final-redhat-00003.json.bz2",
  "3_quarkus-bom-3.2.10.Final-redhat-00002.json.bz2",
  "3_quarkus-bom-3.2.11.Final-redhat-00001.json.bz2",
  "3_quarkus-bom-3.2.12.Final-redhat-00002.json.bz2",
  "4_RHEL-9-FAST-DATAPATH.json.bz2",
  "jboss-eap-7_eap74-openjdk8-openshift-rhel8.json.bz2",
  "jboss-eap-7_eap74-openjdk11-openshift-rhel8.json.bz2",
  "quay-builder-qemu-rhcos-rhel-8-amd64.json.bz2",
  "quay-builder-qemu-rhcos-rhel-8-image-index.json.bz2",
  "quay-builder-qemu-rhcos-rhel-8-product.json.bz2",
  "quay-builder-qemu-rhcos-rhel8-v3.14.0-4-binary.json.bz2",
  "quay-builder-qemu-rhcos-rhel8-v3.14.0-4-index.json.bz2",
  "quay-v3.14.0-product.json.bz2",
];

let sbomIds: string[] = [];

const REPORT_FILE_PREFIX = "report-perf-delete";

type Performance = {
  sbomId: string;
  deleteDuration: number | undefined;
};

const writePerformanceDataToFile = (filename: string, data: Performance[]) => {
  writeRequestDurationToFile(filename, "No.", "SBOM ID", "Duration [ms]");
  data.forEach((item, index) => {
    writeRequestDurationToFile(
      filename,
      index + 1,
      item.sbomId,
      item.deleteDuration,
    );
  });
};

test.describe("Performance / Deletion", { tag: "@performance" }, () => {
  test.beforeEach(async ({ axios }) => {
    logger.info("Uploading SBOMs before deletion performance tests.");

    const uploadResponses = await uploadSboms(axios, SBOM_DIR, SBOM_FILES);
    sbomIds = uploadResponses.map((response) => response.data.id);

    sbomIds.forEach((id) => {
      logger.info(id);
    });
    logger.info(`Uploaded ${sbomIds.length} SBOMs.`);
  });

  test("SBOMs / Sequential", async ({ axios }) => {
    // Gather performance data
    const performance: Performance[] = [];
    for (let i = 0; i < sbomIds.length; i++) {
      const sbomId = sbomIds[i];
      const response = await axios.delete(`/api/v2/sbom/${sbomId}`);
      const deleteDuration = response.duration;

      performance.push({ sbomId, deleteDuration });
    }

    // Write results to file
    const currentTimeStamp = Date.now();
    const reportFile = `${REPORT_FILE_PREFIX}-sequential-${currentTimeStamp}.csv`;
    writePerformanceDataToFile(reportFile, performance);
  });

  test("SBOMs / Parallel", async ({ axios }) => {
    // Gather performance data
    const deletionPromises = sbomIds.map(async (sbomId) => {
      const response = await axios.delete(`/api/v2/sbom/${sbomId}`);
      return { sbomId, deleteDuration: response.duration };
    });

    const performance = await Promise.all(deletionPromises);

    // Write results to file
    const currentTimeStamp = Date.now();
    const reportFile = `${REPORT_FILE_PREFIX}-parallel-${currentTimeStamp}.csv`;
    writePerformanceDataToFile(reportFile, performance);
  });

  // Re-try deletion of all SBOMs in case some of the SBOMs didn't get deleted during the tests.
  test.afterEach(async ({ axios }) => {
    logger.info("Cleaning up SBOMs after deletion performance tests.");

    const deletionPromises = sbomIds.map((sbomId) => {
      return axios.delete(`/api/v2/sbom/${sbomId}`);
    });

    try {
      await Promise.all(deletionPromises);
    } catch (_error) {
      logger.warn(
        "Some SBOM deletions were unsuccessful. Check the logs and/or consider deleting the SBOMs manually.",
      );
    }

    sbomIds = [];
  });
});
