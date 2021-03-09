import {
  SEVERITY_COUNT_WARN,
  SEVERITY_COUNT_ERROR,
  SEVERITY_GROUP_WARN,
  SEVERITY_GROUP_ERROR,
  TEST_COUNT,
} from 'resultKeys';
import useSuiteId from 'useSuiteId';
import useTestObjects from 'useTestObjects';

/**
 * Reads the testObjects list and gets full validation result from it.
 */
const genTestsSummary = () => {
  const [testObjects] = useTestObjects();
  const [suiteIdState] = useSuiteId();

  const summary = {
    tests: {},
    groups: {},
    name: suiteIdState.name,
  };

  testObjects.forEach(testObject => {
    const { fieldName, groupName } = testObject;

    summary.tests[fieldName] = genTestObject(summary.tests, testObject);

    if (groupName) {
      summary.groups[groupName] = summary.groups[groupName] || {};
      summary.groups[groupName][fieldName] = genTestObject(
        summary.groups[groupName],
        testObject
      );
    }
  });

  return countFailures(summary);
};

/**
 * Counts the failed tests and adds global counters
 * @param {Object} summary (generated by genTestsSummary)
 */
export const countFailures = summary => {
  summary[SEVERITY_COUNT_ERROR] = 0;
  summary[SEVERITY_COUNT_WARN] = 0;
  summary[TEST_COUNT] = 0;

  for (const test in summary.tests) {
    summary[SEVERITY_COUNT_ERROR] += summary.tests[test][SEVERITY_COUNT_ERROR];
    summary[SEVERITY_COUNT_WARN] += summary.tests[test][SEVERITY_COUNT_WARN];
    summary[TEST_COUNT] += summary.tests[test][TEST_COUNT];
  }
  return summary;
};

export default genTestsSummary;

/**
 *
 * @param {Object} summaryKey The container for the test result data
 * @param {VestTest} testObject
 * @returns {Object} Test result summary
 */
const genTestObject = (summaryKey, testObject) => {
  const { fieldName, isWarning, failed, statement, skipped } = testObject;

  summaryKey[fieldName] = summaryKey[fieldName] || {
    [SEVERITY_COUNT_ERROR]: 0,
    [SEVERITY_COUNT_WARN]: 0,
    [TEST_COUNT]: 0,
  };

  const testKey = summaryKey[fieldName];

  if (skipped) {
    return testKey;
  }

  summaryKey[fieldName][TEST_COUNT]++;

  // Adds to severity group
  const addTo = (count, group) => {
    testKey[count]++;
    if (statement) {
      testKey[group] = (testKey[group] || []).concat(statement);
    }
  };

  if (failed) {
    if (isWarning) {
      addTo(SEVERITY_COUNT_WARN, SEVERITY_GROUP_WARN);
    } else {
      addTo(SEVERITY_COUNT_ERROR, SEVERITY_GROUP_ERROR);
    }
  }

  return testKey;
};
